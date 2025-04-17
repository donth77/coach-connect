class Booking < ApplicationRecord
    belongs_to :slot
    belongs_to :student, class_name: "User"

    validates :slot_id, uniqueness: true
    validates :slot, presence: true
    validates :student, presence: true
    validates :satisfaction_rating, numericality: { only_integer: true, greater_than: 0, less_than_or_equal_to: 5 }, allow_nil: true
end
