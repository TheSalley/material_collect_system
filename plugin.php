<?php
/*
Plugin Name: 素材收集系统API
Plugin URI: https://www.ehaitech.cn/
Description: 提供外部调用的API，用于查询WordPress数据库
Version: 1.0
Author: M
License: GPL2
*/

// 防止直接访问文件
if (!defined('ABSPATH')) {
    exit;
}

// 注册API路由
add_action('rest_api_init', 'register_custom_db_api_routes');

function register_custom_db_api_routes() {
    // 用户登录接口（POST请求，需提交账号密码）
    register_rest_route('custom-db-api/v1', '/login', [
        'methods' => 'POST', // 登录用POST更安全（避免密码暴露在URL中）
        'callback' => 'custom_user_login',
        'permission_callback' => '__return_true' // 登录接口允许公开访问（任何人都能尝试登录）
    ]);

    // 查询已发布状态的page页
    register_rest_route('custom-db-api/v1', '/publish_pages', [
        'callback' => 'get_publish_pages', // 回调函数
        'permission_callback' => '__return_true' ,// 允许公开访问（生产环境需修改）
        // 'permission_callback' => function () {
        //     return is_user_logged_in();
        // }
    ]);

    // 查询Elemetor数据接口
    register_rest_route('custom-db-api/v1', '/elementor_data', [
        'methods' => 'GET',
        'callback' => 'get_elementor_data', // 回调函数
        'permission_callback' => '__return_true' ,// 允许公开访问（生产环境需修改）
        // 'permission_callback' => function () {
        //     return is_user_logged_in();
        // }
    ]);

    // 更新Elemetor数据接口
    register_rest_route('custom-db-api/v1', '/update_elementor_data', [
        'methods' => 'POST',
        'callback' => 'up_elementor_data', // 回调函数
       'permission_callback' => '__return_true' ,// 允许公开访问（生产环境需修改）
        // 'permission_callback' => function () {
        //     return is_user_logged_in();
        // }
    ]);

    // 上传图片到媒体库接口
    register_rest_route('custom-db-api/v1', '/upload_files', [
        'methods' => 'POST',
        'callback' => 'custom_files_upload', // 回调函数
        'permission_callback' => '__return_true' ,// 允许公开访问（生产环境需修改）
        // 'permission_callback' => function () {
        //     return is_user_logged_in();
        // }
    ]);

}

// 回调函数：登录接口
function custom_user_login($request) {
    $res = $request->get_params();
    // 获取请求参数（用户名/邮箱 + 密码）
    $username = sanitize_text_field($res['username']??''); // sanitize_text_field 过滤字符串
    $password = $res['password']??''; // 密码无需转义，后续会被wp_signon处理
    // 验证参数是否完整
    if (empty($username) || empty($password)) {
        return new WP_REST_Response([
            'code' => 100,
            'message' => '请输入用户名和密码'
        ], 400); // 400：参数错误
    }

    // 准备登录参数
    $creds = [
        'user_login'    => $username,
        'user_password' => $password,
        'remember'      => true // 可选：是否记住登录状态
    ];

    // 调用WordPress内置登录函数
    $user = wp_signon($creds, null); // 第二个参数false：不使用cookie（API场景通常用令牌）

    // 处理登录结果
    if (is_wp_error($user)) {
        // 登录失败（如密码错误、用户不存在等）
        return new WP_REST_Response([
            'code' => 101,
            'message' => $user->get_error_message() // 返回具体错误信息（如“错误的用户名或密码”）
        ], 401); // 401：认证失败
    } else {
        // 获取用户角色（roles是一个数组，包含该用户的所有角色）
        $user_roles = $user->roles;
        // 登录成功：返回用户基本信息（注意：不要返回密码等敏感数据）
        return new WP_REST_Response([
            'code' => 0,
            'message' => '登录成功',
            'data' => [
                'user_id'    => $user->ID,
                'username'   => $user->user_login,
                'email'      => $user->user_email,
                'display_name' => $user->display_name,
                'roles'      => $user_roles, // 角色标识（如['administrator']）
                // 可选：生成JWT令牌（适合前后端分离场景，需额外插件支持）
            ]
        ], 200);
    }
}

// 回调函数：查询已发布状态的page页
function get_publish_pages() {
//    if (!is_user_logged_in()) {
//        return new WP_REST_Response([
//            'success' => false,
//            'message' => '请先登录'
//        ], 401); // 401：未授权（未登录）
//    }

    global $wpdb;
    $table = $wpdb->prefix . 'posts';

    // 执行查询
    $query = "SELECT id,post_name FROM ".$table." WHERE post_type = 'page' AND post_status = 'publish'";
    $result = $wpdb->get_results($query, ARRAY_A); // ARRAY_A返回关联数组

    $response = [];
    if ($result) {
        $response = [
            'code' => 0,
            'data' => $result
        ];
        $status = 200;
    } else {
        $response = [
            'code' => 400,
            'message' => '未找到数据'
        ];
    }

    return new WP_REST_Response($response);
}

//回调函数：获取Elementor数据
function get_elementor_data($request) {
    // 获取值
    $res = $request->get_params();
    // 获取请求参数（id）
    $id = sanitize_text_field($res['id']??'');
    // 验证参数是否完整
    if (empty($id)) {
        return new WP_REST_Response([
            'code' => 400,
            'message' => '缺少重要参数'
        ]);
    }
    global $wpdb;
    $table = $wpdb->prefix . 'postmeta';
    // 执行查询
    $query = "SELECT * FROM ".$table." WHERE post_id = $id AND meta_key = '_elementor_data'";
    $result = $wpdb->get_results($query, ARRAY_A); // ARRAY_A返回关联数组
//     $result = $wpdb->get_row($query, ARRAY_A);
	
    $response = [];
    if ($result) {
        $response = [
            'code' => 0,
            'data' => $result[0] ?? []
        ];
        $status = 200;
    } else {
        $response = [
            'code' => 400,
            'message' => '未找到数据'
        ];
        $status = 404;
    }

    return new WP_REST_Response($response);
}


//回调函数：更新Elementor数据
function up_elementor_data($request) {
    try {
        // 检查请求对象
        if (!$request || !is_object($request)) {
            return new WP_REST_Response([
                'code' => 400,
                'message' => '无效的请求对象'
            ], 400);
        }
        
        // 获取原始请求体
        $body = $request->get_body();
        
        if (empty($body)) {
            return new WP_REST_Response([
                'code' => 400,
                'message' => '请求体为空'
            ], 400);
        }
        
        // 解析外层 JSON
        $body_data = json_decode($body, true);
        
        if (json_last_error() !== JSON_ERROR_NONE) {
            return new WP_REST_Response([
                'code' => 400,
                'message' => '请求体 JSON 格式错误: ' . json_last_error_msg()
            ], 400);
        }
    
    // 获取 post_id
    $post_id = isset($body_data['post_id']) ? intval($body_data['post_id']) : 0;
    
    if (empty($post_id)) {
        return new WP_REST_Response([
            'code' => 400,
            'message' => '缺少 post_id 参数'
        ], 400);
    }
    
    // 获取 meta_value
    // 关键：检查 meta_value 的类型
    $meta_value_raw = isset($body_data['meta_value']) ? $body_data['meta_value'] : '';
    
    if (empty($meta_value_raw)) {
        return new WP_REST_Response([
            'code' => 400,
            'message' => '缺少 meta_value 参数'
        ], 400);
    }
    
    // 如果 meta_value 是字符串，直接使用（这是正确的情况）
    // 如果 meta_value 是数组，说明 WordPress 已经解析了，需要重新编码
    if (is_string($meta_value_raw)) {
        $meta_value = $meta_value_raw;
    } else if (is_array($meta_value_raw)) {
        // WordPress 已经解析了 JSON，需要重新编码
        $meta_value = wp_json_encode($meta_value_raw, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    } else {
        return new WP_REST_Response([
            'code' => 400,
            'message' => 'meta_value 格式错误，必须是字符串或数组'
        ], 400);
    }

    // 解码 meta_value（它应该是一个 JSON 字符串）
    $ele_data = json_decode($meta_value, true);
    if (json_last_error() !== JSON_ERROR_NONE) {
        return new WP_REST_Response([
            'code' => 400,
            'message' => 'meta_value JSON格式错误: ' . json_last_error_msg() . ' (类型: ' . gettype($meta_value_raw) . ', 前200字符: ' . substr($meta_value, 0, 200) . ')'
        ], 400);
    }

    $post = get_post($post_id);
    if (!$post) {
        return new WP_REST_Response([
            'code' => 404,
            'message' => "未找到ID为 $post_id 的文章"
        ], 404);
    }

    // 验证 Elementor 数据结构（确保是数组格式）
    if (!is_array($ele_data)) {
        return new WP_REST_Response([
            'code' => 400,
            'message' => 'Elementor 数据格式错误：必须是数组格式'
        ], 400);
    }

    // 检查 Elementor 是否已加载
    if (!class_exists('\Elementor\Plugin')) {
        return new WP_REST_Response([
            'code' => 500,
            'message' => 'Elementor 插件未加载'
        ], 500);
    }

    try {
        $elementor = \Elementor\Plugin::$instance;
        
        // 编码数据（使用与 Elementor 相同的编码选项）
        // Elementor 使用 JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES 来编码数据
        $encoded = wp_json_encode($ele_data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
        if ($encoded === false) {
            return new WP_REST_Response([
                'code' => 400,
                'message' => 'JSON编码失败: ' . json_last_error_msg()
            ], 400);
        }
        
        // 验证编码后的 JSON 是否可以正确解码（确保格式正确）
        $test_decode = json_decode($encoded, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            return new WP_REST_Response([
                'code' => 400,
                'message' => '编码后的 JSON 格式验证失败: ' . json_last_error_msg()
            ], 400);
        }

        // 获取当前数据进行比较
        $old_value = get_post_meta($post_id, '_elementor_data', true);
        if ($old_value === $encoded) {
            return new WP_REST_Response([
                'code' => 0,
                'message' => '保存成功（数据未变更）',
                'updated' => false
            ], 200);
        }

        // 方法1：使用 Elementor Document API 的 save_elements_data 方法（这是正确的方式）
        $document = $elementor->documents->get($post_id, false);
        
        if ($document) {
            // 尝试使用 save_elements_data 方法（Elementor 内部保存元素数据的方法）
            if (method_exists($document, 'save_elements_data')) {
                // save_elements_data 需要传入元素数据数组，而不是 JSON 字符串
                $save_result = $document->save_elements_data($ele_data);
                
                if (!is_wp_error($save_result)) {
                    // 清除缓存
                    $elementor->files_manager->clear_cache();
                    clean_post_cache($post_id);
                    
                    return new WP_REST_Response([
                        'code' => 0,
                        'message' => '保存成功',
                        'updated' => true
                    ], 200);
                }
            }
            
            // 如果 save_elements_data 不存在，尝试使用 set_elements_data + save
            if (method_exists($document, 'set_elements_data') && method_exists($document, 'save')) {
                $document->set_elements_data($ele_data);
                $save_result = $document->save(['status' => $post->post_status]);
                
                if (!is_wp_error($save_result)) {
                    $elementor->files_manager->clear_cache();
                    clean_post_cache($post_id);
                    
                    return new WP_REST_Response([
                        'code' => 0,
                        'message' => '保存成功',
                        'updated' => true
                    ], 200);
                }
            }
        }

        // 方法2：如果 Document API 不可用，使用直接更新 meta（但需要确保格式完全正确）
        // 步骤1：确保页面标记为使用 Elementor 编辑
        update_post_meta($post_id, '_elementor_edit_mode', 'builder');
        
        // 步骤2：更新 Elementor 版本号（确保版本一致）
        $version = defined('ELEMENTOR_VERSION') ? ELEMENTOR_VERSION : '3.0.0';
        update_post_meta($post_id, '_elementor_version', $version);
        
        // 步骤3：更新 Elementor 数据
        // 关键：先删除再添加，确保数据完全替换，避免 WordPress 的过滤器干扰
        delete_post_meta($post_id, '_elementor_data');
        
        // 直接使用 update_post_meta（它会自动处理 add 或 update）
        // 注意：不要使用 wp_slash，因为会破坏 JSON 格式
        update_post_meta((int)$post_id, '_elementor_data', $encoded);
        
        // 验证数据是否正确保存
        $saved_check = get_post_meta($post_id, '_elementor_data', true);
        if (empty($saved_check)) {
            // 如果保存失败，尝试使用 add_post_meta
            add_post_meta($post_id, '_elementor_data', $encoded);
        }
        
        // 验证保存后的数据是否可以正确解码（确保格式正确）
        $saved_data = get_post_meta($post_id, '_elementor_data', true);
        $saved_decoded = json_decode($saved_data, true);
        if (json_last_error() !== JSON_ERROR_NONE) {
            return new WP_REST_Response([
                'code' => 500,
                'message' => '保存后的数据格式验证失败: ' . json_last_error_msg()
            ], 500);
        }
        
        // 验证解码后的数据结构是否与原始数据一致（深度比较）
        if (serialize($saved_decoded) !== serialize($ele_data)) {
            // 如果数据不一致，可能是 WordPress 的过滤器修改了数据，尝试强制保存
            delete_post_meta($post_id, '_elementor_data');
            update_post_meta((int)$post_id, '_elementor_data', $encoded);
        }
        
        // 步骤4：确保 Elementor 页面设置正确
        // 如果页面设置不存在，创建一个默认的
        $page_settings = get_post_meta($post_id, '_elementor_page_settings', true);
        if (empty($page_settings)) {
            update_post_meta($post_id, '_elementor_page_settings', []);
        }
        
        // 步骤5：删除所有相关的缓存和临时数据（强制重新生成）
        delete_post_meta($post_id, '_elementor_css');
        delete_post_meta($post_id, '_elementor_inline_css');
        delete_post_meta($post_id, '_elementor_custom_css');
        delete_post_meta($post_id, '_elementor_controls_usage');
        delete_post_meta($post_id, '_elementor_pro_version');
        
        // 重要：更新 _elementor_template_type（如果不存在）
        $template_type = get_post_meta($post_id, '_elementor_template_type', true);
        if (empty($template_type)) {
            update_post_meta($post_id, '_elementor_template_type', 'wp-page');
        }
        
        // 步骤6：清除 WordPress 对象缓存（必须在清除 Elementor 缓存之前）
        clean_post_cache($post_id);
        wp_cache_delete($post_id, 'posts');
        wp_cache_delete($post_id, 'post_meta');
        
        // 步骤7：触发 Elementor 的保存前钩子
        do_action('elementor/document/before_save', $post_id, [
            'status' => $post->post_status
        ]);
        
        // 步骤8：清除 Elementor 文件缓存
        $elementor->files_manager->clear_cache();
        
        // 步骤9：重新生成 CSS 文件（如果方法存在）
        if (method_exists($elementor->files_manager, 'regenerate_css_files')) {
            try {
                $elementor->files_manager->regenerate_css_files('post', $post_id);
            } catch (Exception $e) {
                // 忽略错误，继续执行
            }
        }
        
        // 步骤10：触发 Elementor 的保存后钩子（确保其他插件/主题能响应）
        do_action('elementor/document/after_save', $post_id, [
            'status' => $post->post_status
        ]);
        
        // 步骤11：强制刷新文档缓存（确保 Elementor 重新加载数据）
        if ($document) {
            // 清除文档内部缓存
            if (method_exists($document, 'get_elements_data')) {
                // 强制重新获取文档（清除缓存）
                $elementor->documents->get($post_id, false, true);
            }
        } else {
            // 如果文档不存在，尝试创建
            $elementor->documents->get($post_id, false);
        }
        
        // 步骤12：最后再次清除缓存（确保所有更改生效）
        $elementor->files_manager->clear_cache();
        clean_post_cache($post_id);
        // 注意：不要使用 wp_cache_flush()，因为它会清除所有缓存，可能影响其他请求

        return new WP_REST_Response([
            'code' => 0,
            'message' => '保存成功',
            'updated' => true
        ], 200);

    } catch (Exception $e) {
        // 记录错误到 WordPress 错误日志
        error_log('Elementor 数据保存错误: ' . $e->getMessage());
        error_log('错误堆栈: ' . $e->getTraceAsString());
        
        return new WP_REST_Response([
            'code' => 500,
            'message' => '保存时发生错误: ' . $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine()
        ], 500);
    } catch (Error $e) {
        // 捕获 PHP 7+ 的 Error 异常
        error_log('Elementor 数据保存致命错误: ' . $e->getMessage());
        error_log('错误堆栈: ' . $e->getTraceAsString());
        
        return new WP_REST_Response([
            'code' => 500,
            'message' => '保存时发生致命错误: ' . $e->getMessage(),
            'file' => $e->getFile(),
            'line' => $e->getLine()
        ], 500);
    }
}


// 文件上传
function custom_file_upload($request) {
    // 检查是否有文件上传
    if (empty($_FILES['file'])) {
        return new WP_REST_Response([
            'success' => false,
            'message' => '未上传文件'
        ], 400);
    }

    // 准备文件数组（将$_FILES格式转换为便于循环的结构）
    $files = [];
    $file_info = $_FILES['file'];
    $file_count = count($_FILES['files']['name']);
    for ($i = 0; $i < $file_count; $i++) {
        $files[] = [
            'name' => $_FILES['files']['name'][$i],
            'type' => $_FILES['files']['type'][$i],
            'tmp_name' => $_FILES['files']['tmp_name'][$i],
            'error' => $_FILES['files']['error'][$i],
            'size' => $_FILES['files']['size'][$i]
        ];
    }

    $upload_results = []; // 存储所有图片的上传结果
    $allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    $max_size = 100 * 1024 * 1024; // 单张图片最大5MB

    // 加载WordPress媒体处理函数
    require_once ABSPATH . 'wp-admin/includes/image.php';
    require_once ABSPATH . 'wp-admin/includes/file.php';
    require_once ABSPATH . 'wp-admin/includes/media.php';

     // 循环处理每张图片
    foreach ($files as $index => $file) {
        $result = [
            'original_name' => $file['name'],
            'success' => false
        ];

        // 验证文件类型
        if (!in_array($file['type'], $allowed_types)) {
            $result['message'] = '不支持的文件类型';
            $upload_results[] = $result;
            continue;
        }

        // 验证文件大小
        if ($file['size'] > $max_size) {
            $result['message'] = '文件过大';
            $upload_results[] = $result;
            continue;
        }

        // 验证上传错误
        if ($file['error'] !== UPLOAD_ERR_OK) {
            $error_messages = [
                UPLOAD_ERR_INI_SIZE => '超过php.ini限制',
                UPLOAD_ERR_FORM_SIZE => '超过表单限制',
                UPLOAD_ERR_PARTIAL => '文件仅部分上传',
                UPLOAD_ERR_NO_FILE => '未上传文件',
                UPLOAD_ERR_NO_TMP_DIR => '缺少临时文件夹',
                UPLOAD_ERR_CANT_WRITE => '写入失败',
                UPLOAD_ERR_EXTENSION => '被扩展阻止'
            ];
            $result['message'] = $error_messages[$file['error']] ?? '上传失败';
            $upload_results[] = $result;
            continue;
        }

        // 临时保存文件到$_FILES（media_handle_upload需要标准的$_FILES格式）
        $_FILES['temp_image'] = $file;
        $attachment_id = media_handle_upload('temp_image', 0);

        // 处理上传结果
        if (is_wp_error($attachment_id)) {
            $result['message'] = $attachment_id->get_error_message();
            $upload_results[] = $result;
        } else {
            $attachment = get_post($attachment_id);
            $result['success'] = true;
            $result['message'] = '上传成功';
            $result['data'] = [
                'attachment_id' => $attachment_id,
                'url' => wp_get_attachment_url($attachment_id),
                'title' => $attachment->post_title,
                'mime_type' => $attachment->post_mime_type,
                'size' => $file['size']
            ];
            $upload_results[] = $result;
        }
    }

    // 统计成功/失败数量
    $success_count = 0;
    foreach ($upload_results as $item) {
        if ($item['success']) $success_count++;
    }

    return new WP_REST_Response([
        'code' => 0,
        'message' => "成功上传",
        'data' => $upload_results // 每张图片的详细结果
    ]);
    
    //  return new WP_REST_Response([
    //     'success' => $success_count > 0,
    //     'total' => count($upload_results),
    //     'success_count' => $success_count,
    //     'results' => $upload_results // 每张图片的详细结果
    // ], 0);
}


function custom_files_upload($request) {
    // 1. 修复：字段名改为 file（与前端默认字段名匹配）
    if (empty($_FILES['file'])) {
        return new WP_REST_Response([
            'code' => 1,
            'message' => '未上传文件',
            'data' => []
        ], 400);
    }

    // 2. 修复：处理单文件/多文件（字段名改为 file）
    $files = [];
    $file_info = $_FILES['file'];
    // 判断是单文件（name 是字符串）还是多文件（name 是数组）
    if (is_array($file_info['name'])) {
        // 多文件：循环处理
        $file_count = count($file_info['name']);
        for ($i = 0; $i < $file_count; $i++) {
            if (empty($file_info['name'][$i])) continue;
            $files[] = [
                'name' => $file_info['name'][$i],
                'type' => $file_info['type'][$i],
                'tmp_name' => $file_info['tmp_name'][$i],
                'error' => $file_info['error'][$i],
                'size' => $file_info['size'][$i]
            ];
        }
    } else {
        // 单文件：直接包装成数组
        $files[] = [
            'name' => $file_info['name'],
            'type' => $file_info['type'],
            'tmp_name' => $file_info['tmp_name'],
            'error' => $file_info['error'],
            'size' => $file_info['size']
        ];
    }

    if (empty($files)) {
        return new WP_REST_Response([
            'code' => 2,
            'message' => '未检测到有效文件',
            'data' => []
        ], 400);
    }

    // 后续逻辑不变（文件验证、上传到 WP 媒体库）
    $upload_results = [];
    $allowed_types = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    $max_size = 100 * 1024 * 1024;
    require_once ABSPATH . 'wp-admin/includes/image.php';
    require_once ABSPATH . 'wp-admin/includes/file.php';
    require_once ABSPATH . 'wp-admin/includes/media.php';

    foreach ($files as $file) {
        $result = [
            'original_name' => $file['name'],
            'success' => false,
            'message' => ''
        ];

        // 文件类型双重验证
        $file_ext = strtolower(pathinfo($file['name'], PATHINFO_EXTENSION));
        $allowed_exts = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
        if (!in_array($file['type'], $allowed_types) || !in_array($file_ext, $allowed_exts)) {
            $result['message'] = '不支持的文件类型（仅允许 JPG/PNG/GIF/WEBP）';
            $upload_results[] = $result;
            continue;
        }

        // 文件大小验证
        if ($file['size'] <= 0 || $file['size'] > $max_size) {
            $result['message'] = $file['size'] <= 0 ? '文件为空' : '文件过大（最大支持 100MB）';
            $upload_results[] = $result;
            continue;
        }

        // 上传错误验证
        if ($file['error'] !== UPLOAD_ERR_OK) {
            $error_messages = [
                UPLOAD_ERR_INI_SIZE => '超过 php.ini 上传大小限制',
                UPLOAD_ERR_FORM_SIZE => '超过表单上传大小限制',
                UPLOAD_ERR_PARTIAL => '文件仅部分上传',
                UPLOAD_ERR_NO_FILE => '未上传文件',
                UPLOAD_ERR_NO_TMP_DIR => '服务器缺少临时文件夹',
                UPLOAD_ERR_CANT_WRITE => '文件写入服务器失败',
                UPLOAD_ERR_EXTENSION => '被 PHP 扩展阻止上传'
            ];
            $result['message'] = $error_messages[$file['error']] ?? "上传失败（错误码：{$file['error']}）";
            $upload_results[] = $result;
            continue;
        }

        // 核心：按 WP 要求的格式包装文件（字段名改为 temp_image）
        $_FILES['temp_image'] = [
            'name' => $file['name'],
            'type' => $file['type'],
            'tmp_name' => $file['tmp_name'],
            'error' => $file['error'],
            'size' => $file['size']
        ];

        $attachment_id = media_handle_upload('temp_image', 0);
        if (is_wp_error($attachment_id)) {
            $result['message'] = "服务器上传失败：" . $attachment_id->get_error_message();
        } else {
            $attachment = get_post($attachment_id);
            if (!$attachment) {
                $result['message'] = '附件创建失败';
            } else {
                $result['success'] = true;
                $result['message'] = '上传成功';
                $result['data'] = [
                    'attachment_id' => $attachment_id,
                    'url' => wp_get_attachment_url($attachment_id),
                    'title' => $attachment->post_title
                ];
            }
        }
        $upload_results[] = $result;
    }

    return new WP_REST_Response([
        'code' => 0,
        'message' => count($upload_results) . ' 个文件处理完成',
        'data' => $upload_results
    ]);
}