class User < ApplicationRecord
    has_many :slots, foreign_key: :coach_id, dependent: :destroy
    has_many :bookings, foreign_key: :student_id, dependent: :destroy

    validates :name, :phone_number, :role, presence: true
    validates :role, inclusion: { in: %w[coach student] }
    validates :preferred_timezone, inclusion: { in: TZInfo::Timezone.all_identifiers }, allow_nil: true
    validates :token, uniqueness: true

    before_create :generate_token

    private

    def generate_token
      self.token ||= SecureRandom.hex(20)
    end
end
