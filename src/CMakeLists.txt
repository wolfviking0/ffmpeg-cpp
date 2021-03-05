# Get all headers
FILE(GLOB_RECURSE HDRS *.h)

# Get all srcs
FILE(GLOB_RECURSE SRCS *.cpp)

# Setup the group source look nicer on Xcode :)
FOREACH(FILE ${SRCS};${HDRS})
    IF("${FILE}" MATCHES ".*\\._")
        # Remove temporary file system
        LIST(REMOVE_ITEM SRCS ${FILE})
        LIST(REMOVE_ITEM HDRS ${FILE})
    ELSE()
        # Get the directory of the source file
        GET_FILENAME_COMPONENT(PARENT_DIR "${FILE}" DIRECTORY)

        # Remove common directory prefix to make the group
        STRING(REPLACE "${CMAKE_CURRENT_SOURCE_DIR}" "" GROUP "${PARENT_DIR}")

        # Make sure we are using windows slashes
        STRING(REPLACE "/" "\\" GROUP "${GROUP}")

        # Group into "Source Files" and "Header Files"
        IF("${FILE}" MATCHES ".*\\.cpp")
            SET(GROUP "Source Files${GROUP}")
        ELSEIF("${FILE}" MATCHES ".*\\.o")
            SET(GROUP "Object Files")
        ELSEIF("${FILE}" MATCHES ".*\\.h")
            SET(GROUP "Header Files${GROUP}")
        ENDIF()

        SOURCE_GROUP("${GROUP}" FILES "${FILE}")
    ENDIF()
ENDFOREACH()

ADD_LIBRARY(${PROJECT_NAME} ${SRCS} ${HDRS})

TARGET_LINK_LIBRARIES(${PROJECT_NAME} PUBLIC System::ffmpeg)

ADD_DEPENDENCIES(${PROJECT_NAME} System::ffmpeg)

FOREACH(HDR ${HDRS})
    # Get the directory of the source file
    GET_FILENAME_COMPONENT(INC "${HDR}" DIRECTORY)
    TARGET_INCLUDE_DIRECTORIES(${PROJECT_NAME} PUBLIC ${INC})
    STRING(REPLACE "${CMAKE_CURRENT_SOURCE_DIR}" "" SUBFOLDER "${INC}")
    INSTALL(FILES ${HDR} DESTINATION ${CMAKE_INSTALL_PREFIX}/include/${SUBFOLDER} )
ENDFOREACH()

INSTALL(TARGETS ${PROJECT_NAME} DESTINATION ${CMAKE_INSTALL_PREFIX}/lib/)
