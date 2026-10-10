from django.db import models
from django.contrib.auth.models import User

class Division(models.Model):
    name = models.CharField(max_length=100, unique=True)
    mentor = models.ForeignKey(
        User, 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True, 
        related_name='mentored_divisions',
        limit_choices_to={'profile__role': 'MENTOR'}
    )
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return self.name

class Assignment(models.Model):
    student = models.OneToOneField(
        User, 
        on_delete=models.CASCADE, 
        related_name='division_assignment',
        limit_choices_to={'profile__role': 'STUDENT'}
    )
    division = models.ForeignKey(
        Division, 
        on_delete=models.CASCADE, 
        related_name='students'
    )
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = 'mentor_assignments'

    def __str__(self):
        return f"{self.student.username} -> {self.division.name}"
