# Etapa 1 — build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copiar csproj
COPY back/FarmaciaAPI/FarmaciaAPI.csproj ./FarmaciaAPI.csproj
RUN dotnet restore FarmaciaAPI.csproj

# Copiar fonte
COPY back/FarmaciaAPI/. .

# Copiar banco de dados
COPY back/FarmaciaAPI/farmacia.db ./farmacia.db

RUN dotnet publish -c Release -o /app/publish

# Etapa 2 — runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

# Copiar publicação
COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:10000
EXPOSE 10000

ENTRYPOINT ["dotnet", "FarmaciaAPI.dll"]
