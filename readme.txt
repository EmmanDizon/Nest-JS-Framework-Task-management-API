yarn global add @nestjs/cli or npm i -g @nestjs/cli // install globally

nest new . // initialize nest JS boilerplate

yarn start:dev // starting app in dev mode with watching

create modules:
	- nest g module tasks

create controller:
	- nest g controller tasks --no-spec

create service:
	- nest g service tasks --no-spec

add uuid:
 	- yarn add uuid

validation technology:
 	- yarn add class-validator class-transformer

Type ORM for querying:
 	- yarn add typeorm @nestjs/typeorm pg

authentication
	- yarn add @nestjs/jwt @nestjs/passport passport passport-jwt
	- yarn add @types/passport-jwt