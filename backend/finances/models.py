from django.db import models
from users.models import CustomUser

class Income(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='incomes')
    title = models.CharField(max_length=100)  # Made required
    description = models.TextField(null=True, blank=True)  # New field: optional
    category = models.CharField(max_length=50, default='income')
    income = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()

    def __str__(self):
        return f"{self.user.username} - {self.title}: {self.income} on {self.date}"


class Expense(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='expenses')
    title = models.CharField(max_length=100)  # Made required
    description = models.TextField(null=True, blank=True)  # New field: optional
    category = models.CharField(max_length=50, default='expenses')
    expense = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()

    def __str__(self):
        return f"{self.user.username} - {self.title}: {self.expense} on {self.date}"
    
class MonthlyBudget(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='monthly_budgets')
    title = models.CharField(max_length=20) 
    month = models.CharField(max_length=7)  
    year = models.PositiveIntegerField()
    amount = models.DecimalField(max_digits=10, decimal_places=2)
    description = models.TextField(blank=True, null=True)
    
    def __str__(self):
        return f"Budget for {self.month} {self.year} - {self.user}"
