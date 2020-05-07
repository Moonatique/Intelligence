# This file is responsible for configuring your application
# and its dependencies with the aid of the Mix.Config module.
#
# This configuration file is loaded before any dependency and
# is restricted to this project.

# General application configuration
use Mix.Config

config :intelligence,
  ecto_repos: [Intelligence.Repo]

# Configures the endpoint
config :intelligence, IntelligenceWeb.Endpoint,
  url: [host: "localhost"],
  secret_key_base: "iRe7lX3zumAeVSvh6Io/fip6K9gfxsCSJMPmNb4U45pMY196y1qSdCOxd9qZMzW3",
  render_errors: [view: IntelligenceWeb.ErrorView, accepts: ~w(html json)],
  pubsub: [name: Intelligence.PubSub, adapter: Phoenix.PubSub.PG2],
  live_view: [signing_salt: "bjX1XCIT"]

# Configures Elixir's Logger
config :logger, :console,
  format: "$time $metadata[$level] $message\n",
  metadata: [:request_id]

# Use Jason for JSON parsing in Phoenix
config :phoenix, :json_library, Jason

# Import environment specific config. This must remain at the bottom
# of this file so it overrides the configuration defined above.
import_config "#{Mix.env()}.exs"
