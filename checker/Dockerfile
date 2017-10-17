FROM python:3.6-alpine

RUN apk add --no-cache curl
RUN cd /usr/local/bin && \
    curl -LO https://storage.googleapis.com/kubernetes-release/release/v1.7.2/bin/linux/amd64/kubectl && \
    chmod +x kubectl
RUN pip3 install awscli

ADD check.py /check.py
