class ApplicationController < ActionController::API
    rescue_from ActiveRecord::RecordNotFound, with: :not_found

    before_action :authenticate_with_token

    private

    def authenticate_with_token
      token = request.headers["Authorization"]&.match(/^Bearer (.+)$/)&.captures&.first
      @current_user = User.find_by(token: token)

      unless @current_user
        render json: { error: "Unauthorized user" }, status: :unauthorized
      end
    end

    def not_found
      render json: { error: "Record not found" }, status: :not_found
    end
end
