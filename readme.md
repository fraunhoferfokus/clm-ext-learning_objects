**This microservice is based upon  [clm-core](https://github.com/fraunhoferfokus/clm-core) and extends the basic functionalities with additional features**

## CLM-EXT-LEARNING_OBJECTS
This service facilitates the management of learning objects. Learning objects are essentially courses, which can be nested within each other as needed. A learning object becomes a 'launchable object' when it is linked to a tool capable of being launched. Enrollments to these learning or launchable objects can be made via existing users and groups. Once enrolled, a user is authorized to access and utilize the associated tool.
## Requirements
- MariaDB, set up locally.
- Node.js 20.x
### Folder Structure
root

├── api-docs # Open API 3.0.0 definition as .yaml file documenting all routes and data models this service offers.

├── docs # Developer documentation of all functions, classes, interfaces, types this service exposes as an npm package.

├── dist # The built TypeScript project transpiled to JavaScript.

└── src # Business-relevant logic for this web server.

### Architecture
![Entit Relationship Model](assets/clm.EntityRelationshipdiagram.v1p0p0.svg)

The Entity Relationship Model of the Open Core is shown above.

This service defines its own resources as well as serving resources that originate from other modules. 

#### LearningObjects

- Learning objects can be regarded as courses that are capable of being nested within each other as needed. This feature allows for the mapping of complex structures.
- These objects can be linked with launchable tools. This linkage enables the display of digital learning content at a specified level in the learning structure.

#### Enrolments
- Based on the enrollments of a specific user for learning objects, the course structure can be reproduced in IMS-CC format

#### Users ([clm-core](https://github.com/fraunhoferfokus/clm-core))
- The user is required to obtain their group memberships

#### Groups ([clm-core](https://github.com/fraunhoferfokus/clm-core))
- Group membership characteristics such as the roles associated with the group are integrated in the IMS-CC

#### ServiceProviders ([clm-ext-service_providers](https://github.com/fraunhoferfokus/clm-ext-service_providers))
- Required to obtain all user-specific service providers and their associated tools.

#### Tool ([clm-ext-tools](https://github.com/fraunhoferfokus/clm-ext-tools))
- Is required to integrate tool-specific features in the IMS-CC

This service functions as a web microservice that can be orchestrated through a gateway and as an npm package to provide functionalities to other CLM extensions. A microservice can build upon the classes/types/interfaces of this service to extend basic functionalities.

## Setup for testing the webserver 

1. npm install
2. Copy .env.default to .env and overwrite needed properties

Following table gives an overview of the settings you can change through the environment variables

| Name                 | Example                                                                         | Required (Yes/No) | Description                                                                                                                           |
| -------------------- | ------------------------------------------------------------------------------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------------- |
| PORT                 | 3006                                                                            | Yes               | The port on which the service should be deployed.                                                                                     |
| DEPLOY_URL           | HOST_PROTOCOL://HOST_ADDRESS:GATEWAY_PORT/api                                   | Yes               | The address where all microservices are to be orchestrated. A /api must be appended.                                                  |
| MARIA_CONFIG         | MARIA_HOST_ADDRESS\|MARIA_PORT\|MARIA_DATABASE\|MARIA_USER\|MARIA_USER_PASSWORD | Yes               | A comma-separated string that must contain the configured parameters that were previously defined during the installation of MariaDB. |
| TOKEN_SECRET         | secret                                                                          | Yes               | to sign and verify JWTs for authentication. Have to be the same across all modules of the Open-Core                                    |
| DISABLE_ERR_RESPONSE | true                                                                            | No                | Flag to control whether error responses should be returned. Defaults to example value if not set.                                     |




3.1 `npm run dev` for development with nodemon
3.2 `npm start` for deployment

4.  Subsequently, the JSON representation of the Open-API specification should be accessible at:

`http://localhost:${PORT}/learningObjects/swagger`

**To access the API endpoints detailed in the Open-API specification, an API token is required. This token is generated during the initialization of the clm-core module. For further details, please consult the documentation at [clm-core](https://github.com/fraunhoferfokus/clm-core).**


## For Consumption as an NPM Package

- Documentation about all exposed modules can be found under `/docs`.
- Include the package in your project's `package.json` dependencies:

    ```json
    "dependencies": {
        "clm-ext-learning_objects": "git+https://$token:$token@$url_of_package#$branch_name"
    }
    ```

- To use database-dependent DAOs/DTOs, inject `MARIA_CONFIG` into the environment before importing the module:

    a) Manually in the code:

    ```javascript
    process.env.MARIA_CONFIG = "localhost|3306|clm|root|12345";
    import * as core from 'clm-ext-learning_objects';
    ```

    b) Through `.env` file:

    ```.env
    MARIA_CONFIG=localhost|3306|clm|root|12345
    ```

    ```javascript
    import * as core from 'clm-ext-learning_object';
    ```


# Swagger Documentation

- Accessible routes for this microservice are available at `http://localhost:PORT/learningObjects/swagger` after starting the service.
- Ensure to set up a reverse proxy to route traffic to the respective microservices as shown in the table.

### Changelog

The changelog can be found in the [CHANGELOG.md](CHANGELOG.md) file.

## Get in touch with a developer

Please see the file [AUTHORS.md](AUTHORS.md) to get in touch with the authors of this project.
We will be happy to answer your questions at {clm@fokus.fraunhofer.de}

## License

The project is made available under the license in the file [license.txt](LICENSE.txt)
