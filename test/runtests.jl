# this package
using JSOSuite

# JSO
using ADNLPModels, NLPModels, QuadraticModels, OptimizationProblems

# stdlib
using LinearAlgebra, Test

meta = OptimizationProblems.meta
@testset "Test solve on OptimizationProblems" begin
  for name in meta[meta.nvar .< 100, :name]
    nlp = OptimizationProblems.ADNLPProblems.eval(Meta.parse(name))()
    solve(nlp)
    @test true
    model = OptimizationProblems.PureJuMP.eval(Meta.parse(name))()
    solve(model)
    @test true
  end
end

for solver in eachrow(JSOSuite.solvers)
  nlp = OptimizationProblems.ADNLPProblems.genrose()
  @testset "Test options in $(solver.name)" begin
    # We just test that the solver runs with the options
    if solver.is_available && solver.can_solve_nlp
      if solver.nonlinear_obj
        solve(nlp, solver.name, atol = 1e-5, rtol = 1e-5, max_time = 12.0, max_eval = 10, verbose = 0)
        @test true
      else
        nlp_qm = QuadraticModel(nlp, nlp.meta.x0)
        solve(nlp_qm, solver.name, atol = 1e-5, rtol = 1e-5, max_time = 12.0, max_eval = 10, verbose = 0)
        @test true
      end
    end
  end
end