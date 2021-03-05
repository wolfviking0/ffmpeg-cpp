MACRO(SUBDIRLIST result curdir)
    FILE(GLOB children RELATIVE ${curdir} ${curdir}/*)
    SET(dirlist "")
    FOREACH(child ${children})
        IF(IS_DIRECTORY ${curdir}/${child})
            LIST(APPEND dirlist ${child})
        ENDIF()
    ENDFOREACH()
    SET(${result} ${dirlist})
ENDMACRO()

# SAVING THE DATA PATH INTO A FILE
SET(DATA_FOLDER ${PROJECT_SOURCE_DIR}/data/)
SET(TEST_DATA_FILE
    "\n"
    "#ifndef __DATA_FOLDER_H_\n"
    "#define __DATA_FOLDER_H_\n"
    "\n"
    "/*\n"
    " * These values are automatically set according to their cmake variables.\n"
    " */\n"
    "\n"
    "static const char DATA_FOLDER[] = \"${DATA_FOLDER}\"\\;\n"
    "#endif /* __DATA_FOLDER_H_ */\n"
)
FILE(WRITE ${CMAKE_BINARY_DIR}/D.h ${TEST_DATA_FILE})

# Get list of folder
SUBDIRLIST(SUBDIRS ${CMAKE_CURRENT_SOURCE_DIR})

FOREACH(subdir ${SUBDIRS})
    IF(${subdir} MATCHES "wrapper")
        IF(${subdir} MATCHES "python")
            # Get all python file
            FILE(GLOB_RECURSE PYS ${CMAKE_CURRENT_SOURCE_DIR}/${subdir}/*.py)
            FOREACH(py ${PYS})
                GET_FILENAME_COMPONENT(FILENAME ${py} NAME_WE)
                ADD_TEST(NAME ${FILENAME}-pytest COMMAND python3 ${py} --install ${CMAKE_INSTALL_PREFIX} --data ${DATA_FOLDER})
            ENDFOREACH()
        ELSE()
            # Get all python file
            FILE(GLOB_RECURSE JSS ${CMAKE_CURRENT_SOURCE_DIR}/${subdir}/*.js)
            FOREACH(js ${JSS})
                GET_FILENAME_COMPONENT(FILENAME ${js} NAME_WE)
                ADD_TEST(NAME ${FILENAME}-jstest COMMAND node ${js} --install ${CMAKE_INSTALL_PREFIX} --data ${DATA_FOLDER})
            ENDFOREACH()
        ENDIF()
    ELSE()

        # Get all headers
        FILE(GLOB_RECURSE HDRS ${CMAKE_CURRENT_SOURCE_DIR}/${subdir}/*.h)

        # Get all srcs
        FILE(GLOB_RECURSE SRCS ${CMAKE_CURRENT_SOURCE_DIR}/${subdir}/*.cpp)

        # Create executable
        ADD_EXECUTABLE(${subdir} ${SRCS} ${HDRS})

        # Include directory
        TARGET_INCLUDE_DIRECTORIES(${subdir} PRIVATE ${CMAKE_CURRENT_SOURCE_DIR}/${subdir}/)
        TARGET_INCLUDE_DIRECTORIES(${subdir} PRIVATE ${CMAKE_BINARY_DIR}/)

        # Link to ffmpeg-cpp
        TARGET_LINK_LIBRARIES(${subdir} PUBLIC ffmpeg-cpp)

        # Depend of ffmpeg-cpp
        ADD_DEPENDENCIES(${subdir} ffmpeg-cpp)

        ADD_TEST(NAME ${subdir}-test COMMAND ${subdir})
    ENDIF()
ENDFOREACH()
