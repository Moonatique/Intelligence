defmodule Intelligence.Repo do
  use Ecto.Repo,
    otp_app: :intelligence,
    adapter: Ecto.Adapters.Postgres
end
