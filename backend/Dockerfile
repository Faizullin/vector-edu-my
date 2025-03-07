FROM python:3.12.3-slim-bullseye

ENV PYTHONDONTWRITEBYTECODE 1
ENV PYTHONUNBUFFERED 1

ENV HOME=/home/app
RUN mkdir $HOME
WORKDIR $HOME

# install system dependencies
RUN apt-get update && apt-get install -y gcc netcat

RUN pip install --upgrade pip
COPY ./requirements.txt .
RUN pip install -r requirements.txt

# copy project and collect static files
COPY . .

# copy entrypoint.sh
COPY ./entrypoint.sh .
RUN sed -i 's/\r$//g' entrypoint.sh
RUN chmod +x entrypoint.sh


ENTRYPOINT ["./entrypoint.sh"]