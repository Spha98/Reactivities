using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Domain;
using MediatR;
using Persistence;

namespace Application.Activities
{
    public class Create
    {
        public class Command : IRequest
        {
            public Activity? Activity {get;set;}
        }

        public class Handler : IRequestHandler<Command>
        {
        private readonly DataContext _Context;
            public Handler(DataContext context)
            {
            _Context = context;
            }

            public async Task<Unit> Handle(Command request, CancellationToken cancellationToken)
            {
               _Context.Activities!.Add(request.Activity!);
               await _Context.SaveChangesAsync();

               return Unit.Value;
            }
        }
    }
}