FROM python:3
ENV PYTHONUNBUFFERED 1

# Install required packages
RUN apt update
RUN apt install vim
RUN apt install npm
RUN apt install psmisc
RUN apt install openssh-server

# Deal with supervisor
RUN apt install supervisor
RUN mkdir -p /var/log/supervisor

# Install requirements
RUN pip install -r requirements.txt

COPY supervisord.conf /etc/supervisor/conf.d/supervisor.conf
EXPOSE 8000 3000
CMD ["/usr/bin/supervisord"] 