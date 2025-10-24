FROM ubuntu:22.04

ENV DEBIAN_FRONTEND=noninteractive

RUN apt-get update && \
    apt-get install -y --no-install-recommends \
        sudo \
        git \
        curl \
        wget \
        neofetch \
        ca-certificates \
        build-essential \
        tmate \
        && rm -rf /var/lib/apt/lists/*

RUN useradd -m -s /bin/bash appuser && \
    echo 'appuser ALL=(ALL) NOPASSWD:ALL' >> /etc/sudoers

RUN curl -fsSL https://deb.nodesource.com/setup_18.x | bash - && \
    apt-get install -y nodejs

USER appuser
WORKDIR /home/appuser/app

RUN git clone https://github.com/WackyDawg/proxy-test.git .

RUN chmod +x /home/appuser/app/start.sh

RUN npm install --only=production

EXPOSE 7860

USER root

CMD ["/home/appuser/app/start.sh"]
