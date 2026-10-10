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

class IssueCategory(models.TextChoices):
    ACADEMIC = 'ACADEMIC', 'Academic'
    FACILITIES = 'FACILITIES', 'Facilities'
    MENTORING = 'MENTORING', 'Mentoring'
    ADMINISTRATIVE = 'ADMINISTRATIVE', 'Administrative'
    OTHER = 'OTHER', 'Other'

class IssuePriority(models.TextChoices):
    LOW = 'LOW', 'Low'
    MEDIUM = 'MEDIUM', 'Medium'
    HIGH = 'HIGH', 'High'
    URGENT = 'URGENT', 'Urgent'

class IssueStatus(models.TextChoices):
    OPEN = 'OPEN', 'Open'
    IN_PROGRESS = 'IN_PROGRESS', 'In Progress'
    RESOLVED = 'RESOLVED', 'Resolved'

class Issue(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='issues', limit_choices_to={'profile__role': 'STUDENT'})
    title = models.CharField(max_length=200)
    category = models.CharField(max_length=50, choices=IssueCategory.choices)
    description = models.TextField()
    priority = models.CharField(max_length=20, choices=IssuePriority.choices, default=IssuePriority.MEDIUM)
    status = models.CharField(max_length=20, choices=IssueStatus.choices, default=IssueStatus.OPEN)
    mentor_action = models.TextField(blank=True, null=True)
    mentor_response = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    def __str__(self):
        return f"Issue: {self.title} by {self.student.username}"

class MentoringSession(models.Model):
    student = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sessions_received', limit_choices_to={'profile__role': 'STUDENT'})
    mentor = models.ForeignKey(User, on_delete=models.CASCADE, related_name='sessions_conducted', limit_choices_to={'profile__role': 'MENTOR'})
    date = models.DateField()
    discussion = models.TextField()
    observation = models.TextField(blank=True, null=True)
    action_follow_up = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Session: {self.student.username} with {self.mentor.username} on {self.date}"
