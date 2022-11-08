var documenterSearchIndex = {"docs":
[{"location":"reference/#Reference","page":"Reference","title":"Reference","text":"","category":"section"},{"location":"reference/","page":"Reference","title":"Reference","text":"​","category":"page"},{"location":"reference/#Contents","page":"Reference","title":"Contents","text":"","category":"section"},{"location":"reference/","page":"Reference","title":"Reference","text":"​","category":"page"},{"location":"reference/","page":"Reference","title":"Reference","text":"Pages = [\"reference.md\"]","category":"page"},{"location":"reference/","page":"Reference","title":"Reference","text":"​","category":"page"},{"location":"reference/#Index","page":"Reference","title":"Index","text":"","category":"section"},{"location":"reference/","page":"Reference","title":"Reference","text":"​","category":"page"},{"location":"reference/","page":"Reference","title":"Reference","text":"Pages = [\"reference.md\"]","category":"page"},{"location":"reference/","page":"Reference","title":"Reference","text":"​","category":"page"},{"location":"reference/","page":"Reference","title":"Reference","text":"Modules = [JSOSuite]","category":"page"},{"location":"reference/#JSOSuite.solvers","page":"Reference","title":"JSOSuite.solvers","text":"solvers\n\nDataFrame with the JSO-compliant solvers and their properties.\n\nFor each solver, the following are available:\n\nname::String: name of the solver;\nname_solver::Symbol: name of the solver structure for in-place solve, :not_implemented if not implemented;\nsolve_function::Symbol: name of the function;\nis_available::Bool: true if the solver is available;\nbounds::Bool: true if the solver can handle bound constraints;\nequalities::Bool: true if the solver can handle equality constraints;\ninequalities::Bool: true if the solver can handle inequality constraints;\nspecialized_nls::Bool: true if the solver has a specialized variant for nonlinear least squares;\ncan_solve_nlp::Bool: true if the solver can solve general problems. Some may only solve nonlinear least squares;\nnonlinear_obj::Bool: true if the solver can handle nonlinear objective;\nnonlinear_con::Bool: true if the solver can handle nonlinear constraints;\nhighest_derivative::Int: order of the highest derivative used by the algorithm.\n\n\n\n\n\n","category":"constant"},{"location":"reference/#JSOSuite.select_solvers","page":"Reference","title":"JSOSuite.select_solvers","text":"select_solvers(nlp::AbstractNLPModel, verbose = 1, highest_derivative_available::Integer = 2)\n\nNarrow the list of solvers to solve nlp problem using highest_derivative_available.\n\nThis function checks whether the model has:\n\nlinear or nonlinear constraints;\nunconstrained, bound constraints, equality constraints, inequality constraints;\nnonlinear or quadratic objective.\n\nA linear or quadratic objective is detected if the type of nlp is a QuadraticModel or an LLSModel. The selection between a general optimization problem and a nonlinear least squares is done in solve.\n\nIf no solvers were selected, consider setting verbose to true to see what went wrong.\n\nOutput\n\nselected_solvers::DataFrame: A subset of solvers adapted to the problem nlp.\n\nSee also solve.\n\nExamples\n\nusing ADNLPModels, JSOSuite\nnlp = ADNLPModel(x -> 100 * (x[2] - x[1]^2)^2 + (x[1] - 1)^2, [-1.2; 1.0])\nselected_solvers = JSOSuite.select_solvers(nlp)\nprint(selected_solvers[!, :name])\n\n\n\n\n\n","category":"function"},{"location":"reference/#JSOSuite.solve","page":"Reference","title":"JSOSuite.solve","text":"stats = solve(nlp::Union{AbstractNLPModel, JuMP.Model}; kwargs...)\n\nCompute a local minimum of the optimization problem nlp.\n\nstats = solve(f::Function, x0::AbstractVector, args...; kwargs...)\nstats = solve(F::Function, x0::AbstractVector, nequ::Integer, args...; kwargs...)\n\nDefine an NLPModel using ADNLPModel.\n\nThe solver can be chosen as follows.\n\nstats = solve(solver_name::Symbol, args...; kwargs...)\n\nJuMP.Model are converted in NLPModels via NLPModelsJuMP.jl.\n\nIf your optimization problem has a quadratic or linear objective and linear constraints consider using QuadraticModels.jl or LLSModels.jl for the model definition.\n\nKeyword Arguments\n\nAll the keyword arguments are passed to the selected solver. Keywords available for all the solvers are given below:\n\natol: absolute tolerance;\nrtol: relative tolerance;\nmax_time: maximum number of seconds;\nmax_eval: maximum number of cons + obj evaluations;\nverbose::Int = 0: if > 0, display iteration details every verbose iteration.\n\nFurther possible options are documented in each solver's documentation.\n\nOutput\n\nThe value returned is a GenericExecutionStats, see SolverCore.jl.\n\nExamples\n\nusing JSOSuite\nstats = solve(x -> 100 * (x[2] - x[1]^2)^2 + (x[1] - 1)^2, [-1.2; 1.0], verbose = 0)\nstats\n\nThe list of available solver can be obtained using JSOSuite.solvers[!, :name] or see select_solvers.\n\nusing JSOSuite\nstats = solve(\"DCISolver\", x -> 100 * (x[2] - x[1]^2)^2 + (x[1] - 1)^2, [-1.2; 1.0], verbose = 0)\nstats\n\n\n\n\n\n","category":"function"},{"location":"reference/#SolverBenchmark.bmark_solvers","page":"Reference","title":"SolverBenchmark.bmark_solvers","text":"bmark_solvers(problems, solver_names::Vector{String}; kwargs...)\nbmark_solvers(problems, solver_names::Vector{String}, solvers::Dict{Symbol, Function}; kwargs...)\n\nWrapper to the function SolverBenchmark.bmark_solvers.\n\nArguments\n\nproblems: The set of problems to pass to the solver, as an iterable ofAbstractNLPModel;\nsolver_names::Vector{String}: The names of the benchmarked solvers. They should be valid JSOSuite names, see JSOSuite.solvers.name for a list;\nsolvers::solvers::Dict{Symbol, Function}: A dictionary of additional solvers to benchmark.\n\nOutput\n\nA Dict{Symbol, DataFrame} of statistics.\n\nKeyword Arguments\n\nThe following keywords available are passed to the JSOSuite solvers:\n\natol: absolute tolerance;\nrtol: relative tolerance;\nmax_time: maximum number of seconds;\nmax_eval: maximum number of cons + obj evaluations;\nverbose::Int = 0: if > 0, display iteration details every verbose iteration.\n\nAll the remaining keyword arguments are passed to the function SolverBenchmark.bmark_solvers.\n\nExamples\n\nusing ADNLPModels, JSOSuite\nnlps = (\n  ADNLPModel(x -> 100 * (x[2] - x[1]^2)^2 + (x[1] - 1)^2, [-1.2; 1.0]),\n  ADNLPModel(x -> 4 * (x[2] - x[1]^2)^2 + (x[1] - 1)^2, [-1.2; 1.0]),\n)\nnames = [\"LBFGS\", \"TRON\"] # see `JSOSuite.solvers.name` for the complete list\nstats = bmark_solvers(nlps, names, atol = 1e-3, verbose = 0, colstats = [:name, :nvar, :ncon, :status])\nkeys(stats)\n\nThe second example shows how to add you own solver to the benchmark.\n\nusing ADNLPModels, JSOSolvers, JSOSuite, Logging\nnlps = (\n  ADNLPModel(x -> 100 * (x[2] - x[1]^2)^2 + (x[1] - 1)^2, [-1.2; 1.0]),\n  ADNLPModel(x -> 4 * (x[2] - x[1]^2)^2 + (x[1] - 1)^2, [-1.2; 1.0]),\n)\nnames = [\"LBFGS\", \"TRON\"] # see `JSOSuite.solvers.name` for the complete list\nother_solvers = Dict{Symbol, Function}(\n  :test => nlp -> lbfgs(nlp; mem = 2, atol = 1e-3, verbose = 0),\n)\nstats = bmark_solvers(nlps, names, other_solvers, atol = 1e-3, verbose = 0, colstats = [:name, :nvar, :ncon, :status])\nkeys(stats)\n\n\n\n\n\n","category":"function"},{"location":"#JSOSuite.jl","page":"Home","title":"JSOSuite.jl","text":"","category":"section"},{"location":"tutorial/#JSOSuite.jl-Tutorial","page":"Tutorial","title":"JSOSuite.jl Tutorial","text":"","category":"section"}]
}
