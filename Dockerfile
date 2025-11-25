# Etapa 1 — build
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS build
WORKDIR /src

# Copia apenas o csproj da pasta correta
COPY back/FarmaciaAPI/FarmaciaAPI.csproj ./FarmaciaAPI.csproj
RUN dotnet restore FarmaciaAPI.csproj

# Copia todo o código da pasta onde está a API
COPY back/FarmaciaAPI/. .

RUN dotnet publish -c Release -o /app/publish

# Etapa 2 — runtime
FROM mcr.microsoft.com/dotnet/aspnet:8.0
WORKDIR /app

COPY --from=build /app/publish .

ENV ASPNETCORE_URLS=http://+:10000
EXPOSE 10000

ENTRYPOINT ["dotnet", "FarmaciaAPI.dll"]
