FROM python:3
ENV PYTHONUNBUFFERED 1

# Install required packages
RUN apt update
RUN apt install -y vim
RUN apt install -y npm
RUN apt install -y psmisc
RUN apt install -y openssh-server 

# Deal with supervisor
RUN apt install supervisor
RUN mkdir -p /var/log/supervisor

# Install requirements
COPY requirements.txt .
RUN pip install -r requirements.txt

COPY supervisord.conf /etc/supervisor/conf.d/supervisor.conf
EXPOSE 8000 3000 22
CMD ["/usr/bin/supervisord"] 