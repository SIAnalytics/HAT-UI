FROM harbor.sia-service.kr/research/hat:latest
ENV PYTHONUNBUFFERED 1

# Install required packages
RUN /bin/bash -c "source /opt/conda/bin/activate"
RUN apt update
RUN apt install -y vim
RUN apt install -y npm
RUN apt install -y psmisc
RUN apt install -y openssh-server 
RUN apt install -y curl

# Deal with supervisor configuration
RUN apt install -y supervisor
RUN mkdir -p /var/log/supervisor

# Install requirements
COPY requirements.txt .
RUN pip install -r requirements.txt

# Install REACT
RUN curl -fsSL https://deb.nodesource.com/setup_current.x | bash -
RUN apt install -y nodejs

# Install and configure supervisor
COPY supervisord.conf /etc/supervisor/conf.d/supervisor.conf
EXPOSE 8000 3000 22
CMD ["/usr/bin/supervisord"] 