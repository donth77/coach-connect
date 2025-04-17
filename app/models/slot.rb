class Slot < ApplicationRecord
    belongs_to :coach, class_name: "User"
    has_one :booking, dependent: :destroy

    validates :start_time, :end_time, presence: true
    validate :end_after_start

    private

    def end_after_start
      if end_time && start_time && end_time <= start_time
        errors.add(:end_time, "must be after the start time")
      end
    end
end
