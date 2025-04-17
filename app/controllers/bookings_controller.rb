class BookingsController < ApplicationController
    def show
      booking = Booking.includes(:slot, :student).find(params[:id])
      slot = booking.slot

      unless [ booking.student_id, slot.coach_id ].include?(@current_user&.id) || @current_user&.role == "admin"
        return render json: { error: "Not authorized to view this booking" }, status: :forbidden
      end

      render json: booking
    end

    def create
      if @current_user.role != "student"
        return render json: { error: "Only students can book slots" }, status: :forbidden
      end

      booking = Booking.new(booking_params)
      booking.student = @current_user

      if booking.save
        render json: booking, status: :created
      else
        render json: booking.errors, status: :unprocessable_entity
      end
    end

    def update
      booking = Booking.find(params[:id])

      if @current_user.role == "student"
        # Check student is the one with the booking
        if booking.student_id != @current_user.id
          return render json: { error: "Only the assigned student can update this booking." }, status: :unauthorized
        end

        # Student can only update the rating
        if booking.update(params.require(:booking).permit(:satisfaction_rating))
          render json: booking
        else
          render json: booking.errors, status: :unprocessable_entity
        end

      elsif @current_user.role == "coach"
        # Check coach is the one assigned to the slot
        if booking.slot.coach_id != @current_user.id
          return render json: { error: "Only the assigned coach can update this booking." }, status: :unauthorized
        end

        # Cooach can only update the notes
        if booking.update(params.require(:booking).permit(:notes))
          render json: booking
        else
          render json: booking.errors, status: :unprocessable_entity
        end

      else
        # If the user is neither a student nor a coach, deny access
        render json: { error: "You are not authorized to update this booking." }, status: :forbidden
      end
    end


    private

    def booking_params
      params.require(:booking).permit(:slot_id, :satisfaction_rating, :notes)
    end
end
