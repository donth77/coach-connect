class UsersController < ApplicationController
    # Skip token auth for index and show
    skip_before_action :authenticate_with_token, only: [ :index, :show ]

    def index
      if params[:role] == "coach" && params[:available] == "true"
        # Coaches who have at least one upcoming available slot that is not booked
        users = User
                  .joins(:slots)
                  .left_outer_joins(slots: :booking)
                  .where(role: "coach")
                  .where("slots.start_time > ?", Time.current)
                  .where(bookings: { id: nil })
                  .distinct
      elsif params[:role] == "coach"
        users = User.where(role: "coach")
      elsif params[:role] == "student"
        users = User.where(role: "student")
      else
        users = User.all
      end

      render json: users.map { |user|
        user_data = {
          id: user.id,
          name: user.name,
          phone_number: user.phone_number,
          avatar_url: user.avatar_url,
          token: user.token,
          preferred_timezone: user.preferred_timezone,
          role: user.role,
          created_at: user.created_at,
          updated_at: user.updated_at
        }

        # Include stats only if the `stats` param is true
        if params[:stats] == "true"
          user_data[:sessions_completed] = user.role == "coach" ? user.slots.joins(:booking).where("slots.start_time < ?", Time.current).count : Booking.joins(:slot).where(student_id: user.id).where("slots.start_time < ?", Time.current).count
          user_data[:average_rating] = user.role == "coach" ? user.slots.joins(:booking).average(:satisfaction_rating) : nil

          # Add soonest available slot for coaches
          if user.role == "coach"
            soonest_slot = user.slots
                               .left_outer_joins(:booking)
                               .where("slots.start_time > ?", Time.current)
                               .where(bookings: { id: nil })
                               .order("slots.start_time ASC")
                               .first

            if soonest_slot
              user_data[:soonest_available_slot] = {
                start_time: soonest_slot.start_time,
                end_time: soonest_slot.end_time
              }
            else
              user_data[:soonest_available_slot] = nil
            end
          end
        end

        user_data
      }
    end

    def show
      user = User.find(params[:id])
      render json: user
    end

    def update
      if @current_user.id == params[:id].to_i
        if @current_user.update(user_params)
          render json: @current_user
        else
          render json: @current_user.errors, status: :unprocessable_entity
        end
      else
        render json: { error: "Unauthorized" }, status: :unauthorized
      end
    end

    private

    def user_params
      params.require(:user).permit(:name, :phone_number, :preferred_timezone)
    end
end
