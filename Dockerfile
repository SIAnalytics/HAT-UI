FROM python:3
ENV PYTHONUNBUFFERED 1

# Install required packages
RUN apt update
RUN apt install vim
RUN apt install npm
RUN apt install psmisc
RUN apt install openssh-server

RUN pip install -r requirements.txt