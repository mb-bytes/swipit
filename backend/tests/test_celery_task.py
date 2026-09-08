import sys
sys.path.insert(0, ".")  

from app.celery_task import call_manage_transaction

result = call_manage_transaction.delay("9e03e18c-ae7e-4e69-813a-9e290db587b1")
print(f"Task dispatched: {result.id}")
