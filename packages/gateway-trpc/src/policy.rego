package auth

# TODO: Set this to false when all the rules are added
default permit := true

# -----------------------------------------------------------------------------
# Policies for `user` endpoints
# ------------------------------------------------------------------------------

# Users are allowed to get their own information
permit if {
	input.action == "user.get"
	input.resource.sub == input.principal.subject
}
