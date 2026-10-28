FROM python:3.12-slim
WORKDIR /app
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt
COPY app ./app
COPY config.py dad.py ./
COPY backend/seed.py ./seed.py
ENV FLASK_APP=dad.py
EXPOSE 5000
CMD ["flask", "--app", "dad.py", "run", "--host=0.0.0.0"]
