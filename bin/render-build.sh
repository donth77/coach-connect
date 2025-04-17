#!/usr/bin/env bash

# Exit on error
set -o errexit

bundle install

bin/rails db:migrate
bin/rails db:seed