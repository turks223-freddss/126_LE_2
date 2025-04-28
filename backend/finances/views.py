
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from .models import Income
from .models import Expense
from django.shortcuts import get_object_or_404
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model

User = get_user_model()

class AddIncomeView(APIView):
    def post(self, request):
        user_id = request.data.get('user_id')
        income_amount = request.data.get('income')
        date = request.data.get('date')

        if not all([user_id, income_amount, date]):
            return Response({'error': 'user_id, income, and date are required.'}, status=status.HTTP_400_BAD_REQUEST)

        user = get_object_or_404(User, id=user_id)

        try:
            income = Income.objects.create(
                user=user,
                income=income_amount,
                date=date
            )
            return Response({'message': 'Income added successfully', 'income_id': income.id}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class AddExpenseView(APIView):
    def post(self, request):
        user_id = request.data.get('user_id')
        expense_amount = request.data.get('expense')
        category = request.data.get('category', 'expenses')  # default to 'expenses' if not provided
        date = request.data.get('date')

        if not all([user_id, expense_amount, date]):
            return Response({'error': 'user_id, expense, and date are required.'}, status=status.HTTP_400_BAD_REQUEST)

        user = get_object_or_404(User, id=user_id)

        try:
            expense = Expense.objects.create(
                user=user,
                expense=expense_amount,
                category=category,
                date=date
            )
            return Response({'message': 'Expense added successfully', 'expense_id': expense.id}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)
        