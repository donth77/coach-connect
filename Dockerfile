# Put the ruby ​​version you are using
FROM ruby:3.2.0

# Install the necessary libraries
RUN apt-get update -qq && apt-get install -y postgresql-client

# BUNDLE_FROZEN setting
RUN bundle config --global frozen 1

# Set working directory
WORKDIR /coaching-api

# Copy and install the project gems
COPY Gemfile /coaching-api/Gemfile
COPY Gemfile.lock /coaching-api/Gemfile.lock
RUN bundle config set frozen false && bundle install

# Run entrypoint.sh to delete server.pid
COPY entrypoint.sh /usr/bin/
RUN chmod +x /usr/bin/entrypoint.sh
ENTRYPOINT ["entrypoint.sh"]

# Listen on this specified network port
EXPOSE 3000

# Run rails server
CMD ["rails", "server", "-b", "0.0.0.0"]