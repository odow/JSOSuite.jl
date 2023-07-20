function solve(
  nlp::AbstractNLPModel;
  verbose = 1,
  highest_derivative_available::Integer = 2,
  kwargs...,
)
  select = select_solvers(nlp, verbose, highest_derivative_available)
  (verbose ≥ 1) && println("Solve using $(first(select).name):")
  solver = first(select)
  return solve(Val(Symbol(solver.name)), nlp; verbose = verbose, kwargs...)
end

function solve(
  nlp::AbstractNLSModel;
  verbose = 1,
  highest_derivative_available::Integer = 2,
  kwargs...,
)
  select = select_solvers(nlp, verbose, highest_derivative_available)
  nls_select = select[select.specialized_nls, :]
  solver = if !isempty(nls_select)
    first(nls_select)
  else
    first(select)
  end
  (verbose ≥ 1) && println("Solve using $(solver.name):")
  return solve(Val(Symbol(solver.name)), nlp; verbose = verbose, kwargs...)
end

function solve(solver_name::String, nlp; kwargs...)
  solver = solvers[solvers.name .== solver_name, :]
  if isempty(solver)
    @warn "$(solver_name) does not exist."
    return GenericExecutionStats(nlp)
  end
  return solve(Val(Symbol(solver_name)), nlp; kwargs...)
end

function solve(::Val{solver_name}, nlp; kwargs...) where {solver_name}
  solver = solvers[solvers.name .== string(solver_name), :]
  return eval(solver.solve_function[1])(nlp; kwargs...)
end

# See https://www.artelys.com/docs/knitro/3_referenceManual/userOptions.html for the list of options accepted.
function solve(::Val{:KNITRO}, nlp; kwargs...)
  keywords = Dict(kwargs)
  if :verbose in keys(keywords)
    keywords[:outlev] = keywords[:verbose]
    delete!(keywords, :verbose)
  end
  if :atol in keys(keywords)
    keywords[:opttol_abs] = keywords[:atol]
    keywords[:feastol_abs] = keywords[:atol]
    delete!(keywords, :atol)
  end
  if :rtol in keys(keywords)
    keywords[:opttol] = keywords[:rtol]
    keywords[:feastol] = keywords[:rtol]
    delete!(keywords, :rtol)
  end
  if :max_time in keys(keywords)
    keywords[:maxtime_real] = keywords[:max_time]
    delete!(keywords, :max_time)
  end
  if :max_eval in keys(keywords)
    keywords[:maxfevals] = keywords[:max_eval]
    delete!(keywords, :max_eval)
  end
  return knitro(nlp; keywords...)
end

function solve(::Val{:CaNNOLeS}, nlp; kwargs...)
  return cannoles(nlp; linsolve = :ldlfactorizations, kwargs...)
end

# Selection of possible [options](https://coin-or.github.io/Ipopt/OPTIONS.html#OPTIONS_REF).
function solve(::Val{:IPOPT}, nlp; kwargs...)
  keywords = Dict(kwargs)
  if :verbose in keys(keywords)
    if keywords[:verbose] == 0
      keywords[:print_level] = keywords[:verbose]
    end
    delete!(keywords, :verbose)
  end
  if :atol in keys(keywords)
    @warn "Not implemented option `atol` for IPOPT."
    delete!(keywords, :atol)
  end
  if :rtol in keys(keywords)
    keywords[:tol] = keywords[:rtol]
    delete!(keywords, :rtol)
  end
  if :max_time in keys(keywords)
    max_time = keywords[:max_time]
    if max_time > 0
      keywords[:max_cpu_time] = max_time
    else
      @warn "`max_time` should be positive, ignored parameter."
    end
    delete!(keywords, :max_time)
  end
  if :max_eval in keys(keywords)
    @warn "Not implemented option `max_eval` for IPOPT."
    delete!(keywords, :max_eval)
  end
  if :callback in keys(keywords)
    @warn "Not implemented option `callback` for IPOPT."
    delete!(keywords, :callback)
  end
  return ipopt(nlp; keywords...)
end

function solve(::Val{:RipQP}, nlp::Union{QuadraticModel{T0}, LLSModel{T0}}; max_iter = 200, max_time = 1200.0, kwargs...) where {T0}
  keywords = Dict(kwargs)
  if :verbose in keys(keywords)
    keywords[:display] = convert(Bool, keywords[:verbose])
    delete!(keywords, :verbose)
  end
  itol = if (:atol in keys(keywords)) && (:rtol in keys(keywords))
    ϵ_pdd = T0(keywords[:rtol])
    ϵ_rb = ϵ_rc = T0(keywords[:atol])
    delete!(keywords, :atol)
    delete!(keywords, :rtol)
    RipQP.InputTol(T0, ϵ_pdd = ϵ_pdd, ϵ_rb = ϵ_rb, ϵ_rc = ϵ_rc, max_iter = max_iter, max_time = max_time)
  elseif :atol in keys(keywords)
    ϵ_pdd = T0(keywords[:rtol])
    ϵ_rb = ϵ_rc = T0(keywords[:atol])
    delete!(keywords, :atol)
    RipQP.InputTol(T0, ϵ_pdd = ϵ_pdd, ϵ_rb = ϵ_rb, ϵ_rc = ϵ_rc, max_iter = max_iter, max_time = max_time)
  elseif :rtol in keys(keywords)
    ϵ_pdd = T0(keywords[:rtol])
    ϵ_rb = ϵ_rc = T0(keywords[:atol])
    delete!(keywords, :rtol)
    RipQP.InputTol(T0, ϵ_pdd = ϵ_pdd, ϵ_rb = ϵ_rb, ϵ_rc = ϵ_rc, max_iter = max_iter, max_time = max_time)
  else
    RipQP.InputTol(T0)
  end
  if :max_eval in keys(keywords)
    @warn "Not implemented option `max_eval` for RipQP."
    delete!(keywords, :max_eval)
  end
  if :callback in keys(keywords)
    @warn "Not implemented option `callback` for RipQP."
    delete!(keywords, :callback)
  end
  return ripqp(nlp; itol = itol, keywords...)
end