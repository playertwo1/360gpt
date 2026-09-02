FROM python:3.12.11-alpine3.22@sha256:efcdfa6a6b2fd2afb9c7dfa9a5b288a6f68338b5cfdebe6b637d986067d85757

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

RUN addgroup -S director360 && adduser -S -G director360 director360 \
    && mkdir -p /app /var/lib/director360 \
    && chown -R director360:director360 /app /var/lib/director360

WORKDIR /app
COPY --chown=director360:director360 app.py /app/app.py

USER director360
EXPOSE 8790

CMD ["python", "/app/app.py"]
