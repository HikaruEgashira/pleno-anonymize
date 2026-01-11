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
    spacy>=3.7 \
    langchain>=0.3.27 \
    langchain-community>=0.3.27 \
    confection>=0.1.3 \
    jinja2

# Download spaCy English model
RUN python -m spacy download en_core_web_sm

# Copy spacy-llm package and install
COPY packages/spacy-llm /tmp/spacy-llm
RUN pip install --no-cache-dir /tmp/spacy-llm && rm -rf /tmp/spacy-llm

# Copy application code
COPY app/handler.py app/config.cfg ${LAMBDA_TASK_ROOT}/

# Set handler
CMD ["handler.handler"]
