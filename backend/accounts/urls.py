from django.urls import path
from .views import (
    RegisterView, LoginView, UserDetailView, LogoutView, GoogleAuthView,
    VerifyEmailView, RequestPasswordResetView, ResetPasswordView, VerifyTokenView
)

urlpatterns = [
    path('register/', RegisterView.as_view(), name='register'),
    path('login/', LoginView.as_view(), name='login'),
    path('logout/', LogoutView.as_view(), name='logout'),
    path('me/', UserDetailView.as_view(), name='user-detail'),
    path('google/', GoogleAuthView.as_view(), name='google-auth'),
    path('verify-email/<uuid:token>/', VerifyEmailView.as_view(), name='verify-email'),
    path('request-password-reset/', RequestPasswordResetView.as_view(), name='request-password-reset'),
    path('reset-password/<uuid:token>/', ResetPasswordView.as_view(), name='reset-password'),
    path('verify-token/', VerifyTokenView.as_view(), name='verify-token'),
]