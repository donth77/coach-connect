class SlotsController < ApplicationController
    # Get a specific slot for coach
    def show
      slot = Slot.includes(booking: :student).find(params[:id])

      unless slot.coach_id == @current_user&.id
        return render json: { error: "Not authorized to view this slot" }, status: :forbidden
      end

      booking_data = slot.booking && {
        id: slot.booking.id,
        coach_id: slot.coach_id,
        student_id: slot.booking.student.id,
        student_name: slot.booking.student.name,
        student_phone: slot.booking.student.phone_number,
        avatar_url: slot.booking.student.avatar_url,
        satisfaction_rating: slot.booking.satisfaction_rating,
        notes: slot.booking.notes
      }

      render json: {
        id: slot.id,
        start_time: slot.start_time,
        end_time: slot.end_time,
        booking: booking_data
      }
    end


    # Create a new slot
    def create
      if @current_user.role != "coach"
        return render json: { error: "Only coaches can create slots" }, status: :forbidden
      end

        # Check for overlapping slots
        overlapping_slot = @current_user.slots.where(
          "(start_time < ? AND end_time > ?)",
          slot_params[:end_time],
          slot_params[:start_time]
        ).exists?

        if overlapping_slot
          return render json: { error: "The selected time slot overlaps with an existing slot" }, status: :unprocessable_entity
        end

      slot = Slot.new(slot_params.merge(coach: @current_user))
      if slot.save
        render json: slot, status: :created
      else
        render json: slot.errors, status: :unprocessable_entity
      end
    end

    # Update an existing slot
    def update
      slot = Slot.find(params[:id])

      # Check slot belongs to the current coach
      unless slot.coach_id == @current_user&.id
        return render json: { error: "Not authorized to update this slot" }, status: :forbidden
      end

      if slot.update(slot_params)
        render json: slot
      else
        render json: { errors: slot.errors.full_messages }, status: :unprocessable_entity
      end
    end

    # Destroy a slot
    def destroy
      slot = Slot.find(params[:id])

      # Check slot belongs to the current coach
      unless slot.coach_id == @current_user&.id
        return render json: { error: "Not authorized to delete this slot" }, status: :forbidden
      end

      if slot.destroy
        render json: { message: "Slot deleted successfully" }, status: :ok
      else
        render json: { error: "Failed to delete slot" }, status: :unprocessable_entity
      end
    end


    def coach_slots
      # Ensure the current user is a coach or a valid coach_id is provided
      if @current_user&.role != "coach" && params[:coach_id].blank?
        return render json: { error: "Only coaches or a valid coach_id can access slots" }, status: :forbidden
      end

      # Determine the coach to fetch slots for
      coach = if params[:coach_id].present?
                User.find_by(id: params[:coach_id], role: "coach")
      else
                @current_user
      end

      # Handle invalid coach_id
      unless coach
        return render json: { error: "Coach not found" }, status: :not_found
      end

      begin
        from_time = params[:from_time].present? ? Time.iso8601(params[:from_time]) : Time.current
        to_time = params[:to_time].present? ? Time.iso8601(params[:to_time]) : nil
      rescue ArgumentError
        return render json: { error: "Invalid time format (use ISO8601)" }, status: :bad_request
      end

      slots = coach.slots
                   .includes(booking: :student)
                   .where("start_time >= ?", from_time)
                   .order(start_time: :desc) # Sort by latest sessions first
      slots = slots.where("start_time <= ?", to_time) if to_time

      # Filter by booked status
      if params[:booked] == "true"
        slots = slots.joins(:booking)
      elsif params[:booked] == "false"
        slots = slots.left_outer_joins(:booking).where(bookings: { id: nil })
      end

      render json: slots.map { |slot|
        {
          id: slot.id,
          coach_id: slot.coach_id,
          start_time: slot.start_time,
          end_time: slot.end_time,
          booking: slot.booking ? {
            id: slot.booking.id,
            student_id: slot.booking.student.id,
            student_name: slot.booking.student.name,
            student_phone: slot.booking.student.phone_number,
            student_avatar_url: slot.booking.student.avatar_url,
            satisfaction_rating: slot.booking.satisfaction_rating,
            notes: @current_user&.role == "coach" ? slot.booking.notes : nil # Include notes only if the current user is a coach
            } : nil
        }
      }
    end


    def student_slots
      unless @current_user&.role == "student"
        return render json: { error: "Only students can access their slots" }, status: :forbidden
      end

      begin
        from_time = params[:from_time] ? Time.iso8601(params[:from_time]) : Time.current
        to_time = params[:to_time].present? ? Time.iso8601(params[:to_time]) : nil
      rescue ArgumentError
        return render json: { error: "Invalid time format (use ISO8601)" }, status: :bad_request
      end

      slots = Slot
        .includes(:booking, :coach)
        .where("slots.start_time >= ?", from_time)
        .order(start_time: :desc) # Sort by latest sessions first

      slots = slots.where("slots.start_time <= ?", to_time) if to_time

      # Filter by booked status
      if params[:booked] == "true"
        slots = slots.joins(:booking).where(bookings: { student_id: @current_user.id })
      elsif params[:booked] == "false"
        slots = slots.left_outer_joins(:booking).where(bookings: { id: nil })
      end

      render json: slots.map { |slot|
        {
          id: slot.id,
          coach_id: slot.coach_id,
          coach_name: slot.coach.name,
          coach_phone: slot.coach.phone_number,
          coach_avatar_url: slot.coach.avatar_url,
          start_time: slot.start_time,
          end_time: slot.end_time,
          booking: slot.booking ? {
            id: slot.booking.id,
            student_id: slot.booking.student.id,
            student_name: slot.booking.student.name,
            student_phone: slot.booking.student.phone_number,
            student_avatar_url: slot.booking.student.avatar_url,
            satisfaction_rating: slot.booking.satisfaction_rating
          } : nil
        }
      }
    end

    private

    def slot_params
      params.require(:slot).permit(:start_time, :end_time)
    end
end
