FROM python:3.15.2-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade pip && \
    pip install --no-cache-dir -r requirements.txt pytest-cov
COPY . .
EXPOSE 8000
CMD ["uvicorn", "tests.test_ml_api:app", "--host", "0.0.0.0", "--port", "8000"]
