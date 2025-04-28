from django.db import models
from users.models import CustomUser

class Income(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='incomes')
    category = models.CharField(max_length=50, default='income')
    income = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()

    def __str__(self):
        return f"{self.user.username} - Income: {self.income} on {self.date}"


class Expense(models.Model):
    user = models.ForeignKey(CustomUser, on_delete=models.CASCADE, related_name='expenses')
    category = models.CharField(max_length=50, default='expenses')
    expense = models.DecimalField(max_digits=10, decimal_places=2)
    date = models.DateField()

    def __str__(self):
        return f"{self.user.username} - Expense: {self.expense} on {self.date}"
