FROM public.ecr.aws/lambda/python:3.12

# Install system dependencies
RUN dnf install -y gcc g++ && dnf clean all

# Install Python dependencies
RUN pip install --no-cache-dir \
    fastapi>=0.111 \
    httpx>=0.27.0 \
    mangum>=0.17.0 \
    openai>=1.0.0 \
    presidio-analyzer>=2.2 \
    presidio-anonymizer>=2.2 \
    presidio-image-redactor>=0.0.53 \
    pillow>=10.0.0 \
    spacy>=3.7 \
    spacy-llm>=0.7.3 \
    langchain>=0.3.27 \
    langchain-community>=0.3.27 \
    confection>=0.1.3 \
    jinja2 \
    scalar-fastapi>=1.6.0

# Download spaCy English model
RUN python -m spacy download en_core_web_sm

# Copy application code
COPY app/app.py app/auth.py app/config.cfg ${LAMBDA_TASK_ROOT}/

# Set handler (Mangum wraps FastAPI)
CMD ["app.handler"]
