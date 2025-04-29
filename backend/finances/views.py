
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from .models import Income
from .models import Expense
from django.shortcuts import get_object_or_404
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.db.models import Sum
from django.shortcuts import render
from django.http import JsonResponse
from django.core.serializers import serialize
from rest_framework.decorators import api_view


User = get_user_model()

class AddIncomeView(APIView):
    def post(self, request):
        user_id = request.data.get('user_id')
        income_amount = request.data.get('income')
        date = request.data.get('date')
        title = request.data.get('title', 'Untitled')  # default to 'Untitled' if not provided
        description = request.data.get('description')  # can be None

        if not all([user_id, income_amount, date]):
            return Response({'error': 'user_id, income, and date are required.'}, status=status.HTTP_400_BAD_REQUEST)

        user = get_object_or_404(User, id=user_id)

        try:
            income = Income.objects.create(
                user=user,
                income=income_amount,
                date=date,
                title=title,
                description=description
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
        title = request.data.get('title', 'Untitled')  # default to 'Untitled' if not provided
        description = request.data.get('description')  # can be None

        if not all([user_id, expense_amount, date]):
            return Response({'error': 'user_id, expense, and date are required.'}, status=status.HTTP_400_BAD_REQUEST)

        user = get_object_or_404(User, id=user_id)

        try:
            expense = Expense.objects.create(
                user=user,
                expense=expense_amount,
                category=category,
                date=date,
                title=title,
                description=description
            )
            return Response({'message': 'Expense added successfully', 'expense_id': expense.id}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class BudgetCalculatorView(APIView):
    def post(self, request):
        user_id = request.data.get('user_id')
        start_date = request.data.get('start_date')
        end_date = request.data.get('end_date')

        if not user_id:
            return Response({'error': 'user_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        if not start_date or not end_date:
            return Response({'error': 'start_date and end_date are required.'}, status=status.HTTP_400_BAD_REQUEST)

        user = get_object_or_404(User, id=user_id)

        # Sum all incomes within date range
        total_income = Income.objects.filter(
            user=user,
            date__range=[start_date, end_date]
        ).aggregate(total=Sum('income'))['total'] or 0

        # Sum all expenses within date range
        total_expense = Expense.objects.filter(
            user=user,
            date__range=[start_date, end_date]
        ).aggregate(total=Sum('expense'))['total'] or 0

        # Calculate budget
        budget = total_income - total_expense

        return Response({
            'total_income': float(total_income),
            'total_expense': float(total_expense),
            'budget': float(budget)
        }, status=status.HTTP_200_OK)
        
def finance_details(request, user_id):
    incomes = Income.objects.filter(user_id=user_id)
    expenses = Expense.objects.filter(user_id=user_id)

    combined_data = []

    for income in incomes:
        combined_data.append({
            'type': 'income',
            'category': income.category,
            'amount': float(income.income),
            'title':income.title,
            'description':income.description,
            'date': income.date.isoformat(),  # send date as string
        })

    for expense in expenses:
        combined_data.append({
            'type': 'expense',
            'category': expense.category,
            'amount': float(expense.expense) * -1,  # Expenses are negative
            'title':expense.title,
            'description':expense.description,
            'date': expense.date.isoformat(),  # send date as string
        })

    # Sort by date ascending
    combined_data.sort(key=lambda x: x['date'])

    return JsonResponse({'finance': combined_data})


@api_view(['POST'])
def list_user_income(request):
    user_id = request.data.get('userID')

    if not user_id:
        return Response({"error": "userID is required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = get_object_or_404(User, id=user_id)
    except User.DoesNotExist:
        return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

    incomes = Income.objects.filter(user=user).order_by('-date')

    # Convert to a list of dictionaries
    income_data = [
        {
            "id":income.id,
            "category": income.category,
            "income": float(income.income),
            "date": income.date.strftime("%Y-%m-%d")
        }
        for income in incomes
    ]

    return Response({"user": user.username, "incomes": income_data}, status=status.HTTP_200_OK)

@api_view(['POST'])
def list_user_expense(request):
    user_id = request.data.get('userID')

    if not user_id:
        return Response({"error": "userID is required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = get_object_or_404(User, id=user_id)
    except User.DoesNotExist:
        return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

    expenses = Expense.objects.filter(user=user).order_by('-date')

    expense_data = [
        {
            "id": expense.id,
            "category": expense.category,
            "title": expense.title,
            "expense": float(expense.expense),
            "description": expense.description,
            "date": expense.date.strftime("%Y-%m-%d")
        }
        for expense in expenses
    ]

    return Response({"user": user.username, "expenses": expense_data}, status=status.HTTP_200_OK)

@api_view(['PATCH', 'DELETE'])
def modify_income(request, income_id):
    try:
        income = get_object_or_404(Income, id=income_id)
    except Income.DoesNotExist:
        return Response({"error": "Income entry not found."}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'PATCH':
        category = request.data.get('category')
        amount = request.data.get('income')
        date = request.data.get('date')

        if category is not None:
            income.category = category
        if amount is not None:
            income.income = amount
        if date is not None:
            income.date = date

        income.save()
        return Response({"message": "Income entry updated successfully."}, status=status.HTTP_200_OK)

    elif request.method == 'DELETE':
        income.delete()
        return Response({"message": "Income entry deleted successfully."}, status=status.HTTP_204_NO_CONTENT)
    

@api_view(['PATCH', 'DELETE'])
def modify_expense(request, expense_id):
    try:
        expense = get_object_or_404(Expense, id=expense_id)
    except Expense.DoesNotExist:
        return Response({"error": "Expense entry not found."}, status=status.HTTP_404_NOT_FOUND)

    if request.method == 'PATCH':
        category = request.data.get('category')
        title = request.data.get('title')
        amount = request.data.get('expense')
        description = request.data.get('description')
        date = request.data.get('date')

        if category is not None:
            expense.category = category
        if title is not None:
            expense.title = title
        if amount is not None:
            expense.expense = amount
        if description is not None:
            expense.description = description
        if date is not None:
            expense.date = date

        expense.save()
        return Response({"message": "Expense entry updated successfully."}, status=status.HTTP_200_OK)

    elif request.method == 'DELETE':
        expense.delete()
        return Response({"message": "Expense entry deleted successfully."}, status=status.HTTP_204_NO_CONTENT)