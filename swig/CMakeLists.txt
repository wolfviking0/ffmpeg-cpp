INCLUDE(ExternalProject)

ExternalProject_Add(swig
    GIT_REPOSITORY      https://github.com/swig/swig.git
    GIT_TAG             4b64becbbb6fa86afe3aa00ce89ac26dafad45ab
    PATCH_COMMAND       cd ${CMAKE_CURRENT_BINARY_DIR}/swig-prefix/src/swig &&
                        git clean -xdf &&
                        git reset --hard 4b64becbbb6fa86afe3aa00ce89ac26dafad45ab &&
                        git apply ${CMAKE_CURRENT_SOURCE_DIR}/swig.patch
    CMAKE_ARGS          -D CMAKE_BUILD_TYPE:STRING=${CMAKE_BUILD_TYPE}
                        -D CMAKE_INSTALL_PREFIX:STRING=${CMAKE_CURRENT_BINARY_DIR}/.local/
                        -D CMAKE_POSITION_INDEPENDENT_CODE:BOOL=ON
)

# Swig executable
SET(SWIG_EXE ${CMAKE_CURRENT_BINARY_DIR}/.local/bin/swig)

# Search for various program
SET(PROGS node;npm;node-gyp)

FOREACH(prog ${PROGS})
    STRING(TOUPPER ${prog} PROG)
    FIND_PROGRAM(${PROG}_EXE ${prog})
    IF(${PROG}_EXE)
        MESSAGE(STATUS "Found ${prog}: ${${PROG}_EXE}")
    ELSE()
        MESSAGE(FATAL_ERROR "System cannot found ${prog}")
    ENDIF()
ENDFOREACH()

# We also need python3
FIND_PACKAGE(Python3 COMPONENTS Interpreter Development)

# COMMAND SWIG
SET(AVCODECID -DAVCODECID=\"${FFMPEG_LIBAVCODEC_INCLUDE_DIRS}/libavcodec/codec_id.h\")
SET(AVCODEC -DAVCODEC=\"${FFMPEG_LIBAVCODEC_INCLUDE_DIRS}/libavcodec/codec.h\")
SET(AVUTIL -DAVUTIL=\"${FFMPEG_LIBAVUTIL_INCLUDE_DIRS}/libavutil/avutil.h\")
SET(AVPIXFMT -DAVPIXFMT=\"${FFMPEG_LIBAVUTIL_INCLUDE_DIRS}/libavutil/pixfmt.h\")
SET(AVRATIONAL -DAVRATIONAL=\"${FFMPEG_LIBAVUTIL_INCLUDE_DIRS}/libavutil/rational.h\")
SET(AVFORMAT -DAVFORMAT=\"${FFMPEG_LIBAVFORMAT_INCLUDE_DIRS}/libavformat/avformat.h\")

SEPARATE_ARGUMENTS(SWIG_PY_COMMAND WINDOWS_COMMAND
    "${SWIG_EXE} -threads -c++ -python -Dav_always_inline -DFF_API_AVIOFORMAT=1 -Dav_const -Dav_pure -Dattribute_deprecated -Dav_warn_unused_result ${AVCODEC} ${AVCODECID} ${AVUTIL} ${AVFORMAT} ${AVRATIONAL} ${AVPIXFMT} -o ${CMAKE_CURRENT_BINARY_DIR}/python/${PROJECT_NAME}_py_wrap.cpp -outdir ${CMAKE_CURRENT_BINARY_DIR}/python/ ${CMAKE_CURRENT_SOURCE_DIR}/ffmpeg-cpp.i"
)
SEPARATE_ARGUMENTS(SWIG_JS_COMMAND WINDOWS_COMMAND
    "${SWIG_EXE} -c++ -javascript -node -Dav_always_inline -DFF_API_AVIOFORMAT=1 -Dav_const -Dav_pure -Dattribute_deprecated -Dav_warn_unused_result ${AVCODEC} ${AVCODECID} ${AVUTIL} ${AVFORMAT} ${AVRATIONAL} ${AVPIXFMT} -o ${CMAKE_CURRENT_BINARY_DIR}/nodejs/${PROJECT_NAME}_js_wrap.cpp -outdir ${CMAKE_CURRENT_BINARY_DIR}/nodejs/ ${CMAKE_CURRENT_SOURCE_DIR}/ffmpeg-cpp.i"
)

SET(WRAPPER_NAME FfmpegCpp)

# PYTHON WRAPPER
ADD_CUSTOM_COMMAND(
    OUTPUT ${CMAKE_CURRENT_BINARY_DIR}/python/${PROJECT_NAME}_py_wrap.cpp
    COMMAND ${CMAKE_COMMAND} -E make_directory ${CMAKE_CURRENT_BINARY_DIR}/python/
    COMMAND ${SWIG_PY_COMMAND}
    DEPENDS swig
)

ADD_CUSTOM_TARGET(${PROJECT_NAME}_py_swig ALL DEPENDS ${CMAKE_CURRENT_BINARY_DIR}/python/${PROJECT_NAME}_py_wrap.cpp)

SET_SOURCE_FILES_PROPERTIES(${CMAKE_CURRENT_BINARY_DIR}/python/${PROJECT_NAME}_py_wrap.cpp PROPERTIES GENERATED TRUE)

ADD_LIBRARY(${PROJECT_NAME}_py SHARED ${CMAKE_CURRENT_BINARY_DIR}/python/${PROJECT_NAME}_py_wrap.cpp)

ADD_DEPENDENCIES(${PROJECT_NAME}_py ffmpeg-cpp)
ADD_DEPENDENCIES(${PROJECT_NAME}_py System::ffmpeg)

SET_TARGET_PROPERTIES(${PROJECT_NAME}_py PROPERTIES PREFIX "_")
SET_TARGET_PROPERTIES(${PROJECT_NAME}_py PROPERTIES SUFFIX ".so")
SET_TARGET_PROPERTIES(${PROJECT_NAME}_py PROPERTIES OUTPUT_NAME "${WRAPPER_NAME}")
SET_TARGET_PROPERTIES(${PROJECT_NAME}_py PROPERTIES LIBRARY_OUTPUT_DIRECTORY ${CMAKE_INSTALL_PREFIX}/python/${WRAPPER_NAME}/)

TARGET_INCLUDE_DIRECTORIES(${PROJECT_NAME}_py PRIVATE ${Python3_INCLUDE_DIRS} ${Python3_NumPy_INCLUDE_DIRS})
TARGET_LINK_LIBRARIES(${PROJECT_NAME}_py PRIVATE ${Python3_LIBRARIES})
TARGET_LINK_LIBRARIES(${PROJECT_NAME}_py PUBLIC ffmpeg-cpp)

INSTALL(TARGETS ${PROJECT_NAME}_py DESTINATION ${CMAKE_INSTALL_PREFIX}/python/${WRAPPER_NAME})
INSTALL(DIRECTORY ${CMAKE_CURRENT_BINARY_DIR}/python/ DESTINATION ${CMAKE_INSTALL_PREFIX}/python/${WRAPPER_NAME} FILES_MATCHING PATTERN "*.py")

# NODEJS WRAPPER
IF(BUILD_SHARED_LIBS)
    SET(LIBNAME ${CMAKE_SHARED_LIBRARY_PREFIX}${PROJECT_NAME}${CMAKE_SHARED_LIBRARY_SUFFIX})
ELSE()
    SET(LIBNAME ${CMAKE_STATIC_LIBRARY_PREFIX}${PROJECT_NAME}${CMAKE_STATIC_LIBRARY_SUFFIX})
ENDIF()

SET(BINDING ${CMAKE_CURRENT_BINARY_DIR}/nodejs/binding.gyp)
IF("${CMAKE_BUILD_TYPE}" STREQUAL "Debug")
    SET(DEF _DEBUG)
    SET(DEBUG --debug)
    SET(FOLDERBUILD Debug)
ELSE()
    SET(DEF NDEBUG)
    SET(DEBUG)
    SET(FOLDERBUILD Release)
ENDIF()

SET(BINDING_GYP
"{
    \"targets\":
    [
        {
            \"target_name\": \"${WRAPPER_NAME}\",
            \"cflags!\": [
                \"-fno-exceptions\"
            ],
            \"cflags_cc!\": [
                \"-fno-exceptions\"
            ],
            \"defines\": [
                \"${DEF}\"
            ],
            \"sources\": [
                \"${PROJECT_NAME}_js_wrap.cpp\"
            ],
            \"include_dirs\": [
                \"${PROJECT_SOURCE_DIR}/src/\",
                \"${PROJECT_SOURCE_DIR}/src/Codecs\",
                \"${PROJECT_SOURCE_DIR}/src/Demuxing\",
                \"${PROJECT_SOURCE_DIR}/src/FrameSinks\",
                \"${PROJECT_SOURCE_DIR}/src/Info\",
                \"${PROJECT_SOURCE_DIR}/src/Muxing\",
                \"${PROJECT_SOURCE_DIR}/src/Sources\",
")

GET_TARGET_PROPERTY(INCLUDEFFMPEG System::ffmpeg INTERFACE_INCLUDE_DIRECTORIES)
FOREACH(INCLUDE ${INCLUDEFFMPEG})
    SET(BINDING_GYP "${BINDING_GYP}                \"${INCLUDE}\",
")
ENDFOREACH()

SET(BINDING_GYP
        "${BINDING_GYP}
            ],
")


IF(APPLE)
    SET(BINDING_GYP
            "${BINDING_GYP}            \"libraries\": [
                \"-rpath '@loader_path/'\",
                \"${CMAKE_BINARY_DIR}/src/${LIBNAME}\",
")
ELSE()
    SET(BINDING_GYP
            "${BINDING_GYP}            \"libraries\":[
                \"-Wl,--disable-new-dtags -Wl,-rpath='$\${ORIGIN}/'\",
                \"${CMAKE_BINARY_DIR}/src/${LIBNAME}\",
")
ENDIF()

GET_TARGET_PROPERTY(LIBFFMPEG System::ffmpeg INTERFACE_LINK_LIBRARIES)
FOREACH(LIB ${LIBFFMPEG})
    SET(BINDING_GYP "${BINDING_GYP}                \"${LIB}\",
")
ENDFOREACH()

SET(BINDING_GYP
        "${BINDING_GYP}
            ],
")

SET(BINDING_GYP
            "${BINDING_GYP}            \"conditions\":
            [
                [
                    \"OS=='mac'\", {
                        \"xcode_settings\": {
                            \"MACOSX_DEPLOYMENT_TARGET\": \"${SYSTEM_VERSION}\",
                            \"GCC_ENABLE_CPP_RTTI\": \"YES\",
                            \"GCC_ENABLE_CPP_EXCEPTIONS\": \"YES\",
                            \"OTHER_CFLAGS\": [ \"-std=c++14\", \"-stdlib=libc++\", \"-Wno-unused-result\" ],
                            \"defines\": [ \"__APPLE__\"]
                        }
                    }
                ],
                [
                    \"OS=='linux'\", {
                        \"cflags_cc!\": [ \"-fno-rtti\", \"-fno-exceptions\" ],
                        \"cflags_cc\": [ \"-std=c++14\", \"-frtti\", \"-fexceptions\", \"-fopenmp\", \"-Wno-unused-result\" ],
                        \"cflags\": [ \"-Wno-deprecated-declarations\", \"-fopenmp\", \"-Wno-unused-result\"],
                        \"defines\": [ \"__linux__\"]
                    }
                ]
            ]
        }
    ]
}"
)

FILE(WRITE ${BINDING} ${BINDING_GYP})

SEPARATE_ARGUMENTS(NODE_JS_COMMAND WINDOWS_COMMAND
    "${NODE-GYP_EXE} rebuild ${DEBUG} --arch=x64"
)

ADD_CUSTOM_COMMAND(
    OUTPUT ${CMAKE_CURRENT_BINARY_DIR}/nodejs/${PROJECT_NAME}_js_wrap.cpp
    COMMAND ${CMAKE_COMMAND} -E make_directory ${CMAKE_CURRENT_BINARY_DIR}/nodejs/
    COMMAND ${SWIG_JS_COMMAND}
    DEPENDS swig
)

ADD_CUSTOM_TARGET(${PROJECT_NAME}_js_swig ALL DEPENDS ${CMAKE_CURRENT_BINARY_DIR}/nodejs/${PROJECT_NAME}_js_wrap.cpp)

ADD_CUSTOM_COMMAND(
    OUTPUT ${CMAKE_CURRENT_BINARY_DIR}/nodejs/build/${FOLDERBUILD}/${WRAPPER_NAME}.node
    COMMAND ${NODE_JS_COMMAND}
    WORKING_DIRECTORY ${CMAKE_CURRENT_BINARY_DIR}/nodejs/
)

ADD_CUSTOM_TARGET(${PROJECT_NAME}_js_node ALL DEPENDS ${CMAKE_CURRENT_BINARY_DIR}/nodejs/build/${FOLDERBUILD}/${WRAPPER_NAME}.node)
ADD_DEPENDENCIES(${PROJECT_NAME}_js_node ${PROJECT_NAME}_js_swig)

INSTALL(FILES ${CMAKE_CURRENT_BINARY_DIR}/nodejs/build/${FOLDERBUILD}/${WRAPPER_NAME}.node DESTINATION ${CMAKE_INSTALL_PREFIX}/nodejs/${WRAPPER_NAME})

