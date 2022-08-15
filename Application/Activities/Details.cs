using Application.Core;
using AutoMapper;
using MediatR;
using Persistence;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;
using Application.Interfaces;

namespace Application.Activities
{
    public class Details
    {
        public class Query : IRequest<Result<ActivityDto>>
        {
            public Guid Id { get; set; }
        }
         public class Handler : IRequestHandler<Query, Result<ActivityDto>>
        {
        private readonly DataContext _context;
        private readonly IMapper _Mapper;
        private readonly IUserAccessor _userAccessor;
            public Handler(DataContext context, IMapper mapper,IUserAccessor userAccessor)
            {
            _userAccessor = userAccessor;
            _Mapper = mapper;
            _context = context;
            }

            public async Task<Result<ActivityDto>> Handle(Query request, CancellationToken cancellationToken)
            {
                var activity =  await _context.Activities!
                .ProjectTo<ActivityDto>(_Mapper.ConfigurationProvider,
                new {currentUsername = _userAccessor.GetUsername()} )
                .FirstOrDefaultAsync(x => x.Id == request.Id);
                
                return Result<ActivityDto>.Success(activity!);
            }
        }
    }
}