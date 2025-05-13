from django.contrib.auth import get_user_model, authenticate
from rest_framework import status, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.permissions import IsAuthenticated
from rest_framework.authtoken.models import Token
from google.oauth2 import id_token
from google.auth.transport import requests
from django.conf import settings
import logging
from .utils import send_confirmation_email, send_password_reset_email
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

from .serializers import UserSerializer, UserRegistrationSerializer

User = get_user_model()
logger = logging.getLogger(__name__)


class RegisterView(APIView):
    permission_classes = (permissions.AllowAny,)
    
    def post(self, request):
        serializer = UserRegistrationSerializer(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            # Send confirmation email
            send_confirmation_email(user)
            token, _ = Token.objects.get_or_create(user=user)
            return Response({
                'token': token.key,
                'user': UserSerializer(user).data,
                'message': 'Un email de confirmation a été envoyé à votre adresse email.'
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class LoginView(APIView):
    permission_classes = (permissions.AllowAny,)
    
    def post(self, request):
        email = request.data.get('email')
        password = request.data.get('password')
        
        if email is None or password is None:
            return Response({'error': 'Please provide both email and password'},
                          status=status.HTTP_400_BAD_REQUEST)
        
        try:
            user = User.objects.get(email=email)
            if user.check_password(password):
                token, _ = Token.objects.get_or_create(user=user)
                return Response({
                    'token': token.key,
                    'user': UserSerializer(user).data
                })
            else:
                return Response({'error': 'Invalid credentials'},
                              status=status.HTTP_401_UNAUTHORIZED)
        except User.DoesNotExist:
            return Response({'error': 'Invalid credentials'},
                          status=status.HTTP_401_UNAUTHORIZED)


class LogoutView(APIView):
    permission_classes = (IsAuthenticated,)
    
    def post(self, request):
        request.user.auth_token.delete()
        return Response({'message': 'Successfully logged out'}, status=status.HTTP_200_OK)


class UserDetailView(APIView):
    permission_classes = (IsAuthenticated,)
    
    def get(self, request):
        serializer = UserSerializer(request.user)
        return Response(serializer.data)
    
    def put(self, request):
        serializer = UserSerializer(request.user, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save()
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)


class GoogleAuthView(APIView):
    permission_classes = (permissions.AllowAny,)
    
    def post(self, request):
        try:
            token_id = request.data.get('token_id')
            if not token_id:
                logger.error("No token provided in request")
                return Response({'error': 'No token provided'}, status=status.HTTP_400_BAD_REQUEST)
            
            logger.info("Received Google token for verification")
            logger.info("Using client ID: %s", settings.GOOGLE_OAUTH2_CLIENT_ID)
            
            # Verify the token
            try:
                idinfo = id_token.verify_oauth2_token(
                    token_id, 
                    requests.Request(), 
                    settings.GOOGLE_OAUTH2_CLIENT_ID
                )
                logger.info("Token verified successfully")
            except ValueError as e:
                logger.error("Token verification failed: %s", str(e))
                return Response({'error': f'Token verification failed: {str(e)}'}, 
                              status=status.HTTP_400_BAD_REQUEST)
            
            # Get user info from the token
            email = idinfo['email']
            first_name = idinfo.get('given_name', '')
            last_name = idinfo.get('family_name', '')
            logger.info("User info retrieved from token - Email: %s", email)
            
            # Get or create user
            is_new_user = False
            try:
                user = User.objects.get(email=email)
                logger.info("Existing user found: %s", email)
            except User.DoesNotExist:
                # Create new user
                username = email.split('@')[0]
                base_username = username
                counter = 1
                
                # Ensure unique username
                while User.objects.filter(username=username).exists():
                    username = f"{base_username}{counter}"
                    counter += 1
                
                user = User.objects.create_user(
                    username=username,
                    email=email,
                    first_name=first_name,
                    last_name=last_name
                )
                is_new_user = True
                logger.info("New user created: %s", email)
                
                # Pour les utilisateurs Google, marquer l'email comme vérifié automatiquement
                user.is_email_verified = True
                user.save()
            
            # Generate token for verified users
            token, _ = Token.objects.get_or_create(user=user)
            logger.info("Authentication token generated for user: %s", email)
            
            return Response({
                'token': token.key,
                'user': UserSerializer(user).data,
                'email_verified': True
            })
            
        except ValueError as e:
            logger.error("ValueError in Google auth: %s", str(e))
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.error("Unexpected error in Google auth: %s", str(e), exc_info=True)
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class VerifyEmailView(APIView):
    permission_classes = (permissions.AllowAny,)
    
    def get(self, request, token):
        try:
            user = User.objects.get(email_verification_token=token)
            if user.is_email_verification_token_valid():
                user.is_email_verified = True
                user.save()
                
                # Vérifier si l'email contient "gmail.com" pour identifier les utilisateurs Google
                is_google_user = "gmail.com" in user.email.lower()
                
                # Générer un token d'authentification pour les utilisateurs Google
                if is_google_user:
                    token, _ = Token.objects.get_or_create(user=user)
                    return Response({
                        'message': 'Email vérifié avec succès. Vous allez être redirigé vers l\'application.',
                        'is_google_user': True,
                        'token': token.key,
                        'user': UserSerializer(user).data
                    }, status=status.HTTP_200_OK)
                else:
                    return Response({
                        'message': 'Email vérifié avec succès. Vous pouvez maintenant vous connecter.',
                        'is_google_user': False
                    }, status=status.HTTP_200_OK)
            else:
                return Response({
                    'error': 'Le lien de vérification a expiré. Veuillez demander un nouveau lien.'
                }, status=status.HTTP_400_BAD_REQUEST)
        except User.DoesNotExist:
            return Response({
                'error': 'Lien de vérification invalide.'
            }, status=status.HTTP_400_BAD_REQUEST)


class RequestPasswordResetView(APIView):
    permission_classes = (permissions.AllowAny,)
    
    def post(self, request):
        email = request.data.get('email')
        try:
            user = User.objects.get(email=email)
            user.generate_password_reset_token()
            send_password_reset_email(user)
            return Response({
                'message': 'Un email de réinitialisation de mot de passe a été envoyé.'
            }, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({
                'error': 'Aucun utilisateur trouvé avec cette adresse email.'
            }, status=status.HTTP_404_NOT_FOUND)


class ResetPasswordView(APIView):
    permission_classes = (permissions.AllowAny,)
    
    def post(self, request, token):
        try:
            user = User.objects.get(password_reset_token=token)
            if not user.is_password_reset_token_valid():
                return Response({
                    'error': 'Le lien de réinitialisation a expiré. Veuillez demander un nouveau lien.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            new_password = request.data.get('new_password')
            confirm_password = request.data.get('confirm_password')
            
            if not new_password or not confirm_password:
                return Response({
                    'error': 'Veuillez fournir le nouveau mot de passe et sa confirmation.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            if new_password != confirm_password:
                return Response({
                    'error': 'Les mots de passe ne correspondent pas.'
                }, status=status.HTTP_400_BAD_REQUEST)
            
            try:
                validate_password(new_password, user)
            except ValidationError as e:
                return Response({
                    'error': e.messages
                }, status=status.HTTP_400_BAD_REQUEST)
            
            user.set_password(new_password)
            user.password_reset_token = None
            user.password_reset_token_created_at = None
            user.save()
            
            return Response({
                'message': 'Mot de passe réinitialisé avec succès.'
            }, status=status.HTTP_200_OK)
            
        except User.DoesNotExist:
            return Response({
                'error': 'Lien de réinitialisation invalide.'
            }, status=status.HTTP_400_BAD_REQUEST)


class VerifyTokenView(APIView):
    permission_classes = (permissions.AllowAny,)
    
    def post(self, request):
        auth_header = request.headers.get('Authorization')
        if not auth_header or not auth_header.startswith('Token '):
            return Response({'valid': False}, status=status.HTTP_401_UNAUTHORIZED)
        
        token_key = auth_header.split(' ')[1]
        try:
            token = Token.objects.get(key=token_key)
            user = token.user
            return Response({
                'valid': True,
                'user': UserSerializer(user).data
            })
        except Token.DoesNotExist:
            return Response({'valid': False}, status=status.HTTP_401_UNAUTHORIZED)