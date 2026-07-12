@REM ----------------------------------------------------------------------------
@REM Licensed to the Apache Software Foundation (ASF)
@REM Maven Wrapper startup batch script for Windows
@REM ----------------------------------------------------------------------------
@IF "%MAVEN_BATCH_ECHO%" == "on"  echo %MAVEN_BATCH_ECHO%
@IF "%MAVEN_BATCH_PAUSE%" == "on" pause

@ECHO OFF
SETLOCAL ENABLEDELAYEDEXPANSION

SET MAVEN_WRAPPER_JAR=%~dp0.mvn\wrapper\maven-wrapper.jar
SET MAVEN_WRAPPER_PROPERTIES=%~dp0.mvn\wrapper\maven-wrapper.properties

IF NOT EXIST "%MAVEN_WRAPPER_JAR%" (
    IF NOT "%MVNW_VERBOSE%" == "false" @ECHO Downloading Maven Wrapper...
    java -cp "%~dp0.mvn\wrapper" MavenWrapperDownloader %MAVEN_WRAPPER_JAR% %MAVEN_WRAPPER_PROPERTIES%
)

java %MAVEN_OPTS% -cp "%MAVEN_WRAPPER_JAR%" "-Dmaven.multiModuleProjectDirectory=%~dp0" org.apache.maven.wrapper.MavenWrapperMain %*
