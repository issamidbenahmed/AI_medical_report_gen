from django.db import models
from django.conf import settings
import uuid
import os

def report_image_path(instance, filename):
    """Generate file path for a report image"""
    ext = filename.split('.')[-1]
    filename = f"{uuid.uuid4()}.{ext}"
    return os.path.join('report_images', filename)


class Report(models.Model):
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    image = models.ImageField(upload_to=report_image_path)
    diagnosis = models.TextField()
    details = models.TextField()
    accuracy = models.FloatField()
    recommendations = models.JSONField()
    language = models.CharField(max_length=5, default='en')
    created_at = models.DateTimeField(auto_now_add=True)
    
    def __str__(self):
        return f"Report {self.id} - {self.user.email}"
    
    class Meta:
        ordering = ['-created_at']