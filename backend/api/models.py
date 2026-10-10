from django.db import models
from django.contrib.auth.models import User
from django.core.validators import MinValueValidator, MaxValueValidator

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

class FeedbackCategory(models.TextChoices):
    ACADEMIC = 'ACADEMIC', 'Academic Experience'
    FACILITIES = 'FACILITIES', 'College Facilities'
    MENTORING = 'MENTORING', 'Mentoring Experience'
    GENERAL = 'GENERAL', 'General'
    SUGGESTION = 'SUGGESTION', 'Suggestion'

class Feedback(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='feedbacks', limit_choices_to={'profile__role': 'STUDENT'})
    category = models.CharField(max_length=50, choices=FeedbackCategory.choices)
    rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comments = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Feedback by {self.student.username} - {self.category}"

class SatisfactionSurvey(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='surveys', limit_choices_to={'profile__role': 'STUDENT'})
    mentor_satisfaction_rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    mentor_helpfulness_rating = models.IntegerField(validators=[MinValueValidator(1), MaxValueValidator(5)])
    comments = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Survey by {self.student.username}"
