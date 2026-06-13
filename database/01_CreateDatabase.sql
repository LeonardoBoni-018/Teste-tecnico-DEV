IF NOT EXISTS (SELECT * FROM sys.databases WHERE name = 'SoftLineTeste')
BEGIN
    CREATE DATABASE SoftLineTeste;
END
GO

USE SoftLineTeste;
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Usuarios]') AND type = 'U')
BEGIN
    CREATE TABLE Usuarios (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Username NVARCHAR(50) NOT NULL,
        PasswordHash NVARCHAR(500) NOT NULL,
        Nome NVARCHAR(100) NOT NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        CONSTRAINT UQ_Usuarios_Username UNIQUE (Username)
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Produtos]') AND type = 'U')
BEGIN
    CREATE TABLE Produtos (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Codigo INT NOT NULL,
        Descricao NVARCHAR(60) NOT NULL,
        CodigoBarras NVARCHAR(14) NOT NULL,
        ValorVenda DECIMAL(18,2) NOT NULL,
        PesoBruto DECIMAL(18,3) NOT NULL,
        PesoLiquido DECIMAL(18,3) NOT NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        CONSTRAINT UQ_Produtos_Codigo UNIQUE (Codigo)
    );
END
GO

IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[Clientes]') AND type = 'U')
BEGIN
    CREATE TABLE Clientes (
        Id INT IDENTITY(1,1) PRIMARY KEY,
        Codigo INT NOT NULL,
        Nome NVARCHAR(60) NOT NULL,
        Fantasia NVARCHAR(100) NOT NULL,
        Documento NVARCHAR(20) NOT NULL,
        Endereco NVARCHAR(MAX) NOT NULL,
        CreatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        UpdatedAt DATETIME2 NOT NULL DEFAULT GETDATE(),
        CONSTRAINT UQ_Clientes_Codigo UNIQUE (Codigo)
    );
END
GO
