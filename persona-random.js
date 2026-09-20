(() => {
  'use strict';

  const $ = s => document.querySelector(s);

  const PROMPT_TEMPLATE_KEY = 'rhstudio.videoPromptTemplate';
  const PERSONA_RECENT_KEY = 'rhstudio.persona.recent.v1';
  const PERSONA_LAST_KEY = 'rhstudio.persona.last.v1';
  const PERSONA_MIGRATION_KEY = 'rhstudio.persona.templateMigration.v1';

  const CLOTHES_PLACEHOLDER = '{{clothes}}';
  const PERFORMANCE_PLACEHOLDER = '{{performance}}';
  const ACTION_PLACEHOLDER = '{{action}}';

  const RECENT_LIMIT = 30;
  const MAX_ATTEMPTS = 96;

  const DEFAULT_VIDEO_PROMPT_TEMPLATE = [
    '9:16 竖屏，约 15 秒，真人写实手机自拍视频质感，单镜头连续拍摄，无转场，无剪辑。',
    '',
    '一名年轻成年东亚女性站在室内高档烟酒 / 商品零售店的玻璃展示柜前。女性身材纤细修长，长黑发自然披散，侧分发型，精致但自然的日常妆容，佩戴简约耳饰和项链。',
    '',
    '服装：{{clothes}}',
    '',
    '背景是一整面黑色金属框架玻璃商品展示柜，柜内密集整齐陈列不同颜色和尺寸的高档礼盒、盒装商品与条装商品。展示柜内部有连续暖黄色 LED 灯带，玻璃表面存在真实环境反射。背景清晰可辨，只带轻微自然景深。',
    '',
    '### 人物动作',
    '',
    '{{performance}}',
    '{{action}}',
    '',
    '### 镜头',
    '',
    '手机竖屏人像拍摄，摄影机位于人物正前方，约 28–35mm 等效焦段，中景至大腿景别，人物始终占据画面中央主体区域。',
    '',
    '摄影机基本保持原地，不推拉、不环绕、不明显变焦，只存在非常轻微的真人手持漂移和细小晃动，使画面具有真实手机拍摄感，而不是完全机械锁死。',
    '',
    '人物动作是整个视频的主体，镜头始终持续对焦人物脸部和上半身，人物与背景空间关系保持稳定。',
    '',
    '### 光线与质感',
    '',
    '@图1:一家陈列密集的烟草零售店内，整面黑金展示柜摆满彩色烟盒，暖黄色层板灯带自上而下均匀打亮商品，形成金色反射与局部高光，整体呈现温暖、明亮且略带商业橱窗感的室内光影。',
    '',
    '整体曝光明亮干净，暖色温，高动态范围，肤色自然通透但保留真实皮肤纹理。头发、玻璃、金属和商品包装存在自然高光与反射。',
    '',
    '真实高端智能手机视频质感，轻微电子锐度，轻度手机 HDR，没有强烈电影调色，没有过度磨皮，没有强背景虚化。',
    '',
    '### 强制要求',
    '',
    '人物全程保持同一个人、同一张脸、同一发型和稳定人体比例。',
    '',
    '动作节奏服从人物动作描述，保持真实人体重心、惯性和连续性，不机械重复，不做舞蹈式大幅扭动。',
    '',
    '头发必须跟随头部和手部动作产生真实二级运动。',
    '',
    '手指结构自然，不增加手指，不发生手掌融化或穿模。',
    '',
    '背景展示柜结构全程稳定，不变形、不漂移、不随机改变商品位置。',
    '',
    '单镜头到底，无字幕，无文字，无水印，无慢动作，无快速运镜，无突然镜头切换。'
  ].join('\n');

  const PERSONAS = [
    {
      id:'soft_daily_girlfriend', name:'松弛女友感', density:'low',
      states:['轻松、松弛','自然、亲近','随性、真实'],
      camera:['像朋友随手拍到她','像熟人近距离自然记录','对镜头有一点意识但不刻意营业'],
      expression:'表情变化自然，带一点被镜头发现后的真实反应',
      colors:['奶油白','米白','浅灰','深蓝','浅粉','咖色'],
      outfitWeights:{top_pants:25,top_skirt:25,dress:20,top_long_skirt:12,top_shorts:8,set:10},
      topIds:['micro_fitted_tee','fitted_square_rib','soft_wrap_knit','fitted_sleeveless_knit','button_cardigan'],
      skirtIds:['a_line_mini','straight_mini','soft_knit_mini','denim_mini'],
      pantsIds:['dark_straight_jeans','soft_wide_pants','simple_straight_pants'],
      dressIds:['short_sleeve_fitted_dress','square_fitted_dress','waist_sleeveless_dress'],
      signatureGroups:['face_frame','cute'],
      preferredArcs:['soft_to_bright','sweet_to_playful'],
      normalWeights:{pose:28,groom:24,look:22,hand:14,distance:8,body:4},
      humanNoiseRate:.55, secondSignatureRate:.08, expressionCount:[1,2], reactionRate:.8
    },
    {
      id:'playful_social', name:'俏皮社媒感', density:'high',
      states:['轻松、俏皮','活泼、有镜头感','自然营业、互动感明显'],
      camera:['明显知道镜头在哪里并自然给反馈','像真实社媒自拍视频里的自然营业','像熟练拍短视频的人一样和镜头互动'],
      expression:'动作和表情变化丰富，网感强但不夸张',
      colors:['奶油白','浅粉','烟粉','浅灰','雾蓝','白色'],
      outfitWeights:{top_skirt:34,top_shorts:18,dress:18,set:15,top_pants:8,top_long_skirt:7},
      topIds:['cropped_boat_knit','micro_fitted_tee','fitted_square_rib','button_cardigan','fitted_offshoulder_short','fitted_halter'],
      skirtIds:['a_line_mini','soft_knit_mini','pleated_light_mini','straight_mini'],
      shortsIds:['high_waist_denim_shorts','high_waist_fitted_shorts'],
      dressIds:['square_fitted_dress','waist_sleeveless_dress','short_sleeve_fitted_dress'],
      signatureGroups:['heart','v_sign','face_frame','cute'],
      preferredArcs:['sweet_to_playful','soft_to_bright'],
      normalWeights:{pose:18,groom:14,look:12,hand:28,distance:10,body:18},
      humanNoiseRate:.35, secondSignatureRate:.55, expressionCount:[2,3], reactionRate:.95
    },
    {
      id:'sweet_soft', name:'温柔甜感', density:'medium',
      states:['柔和、甜美','轻柔、自然','温柔、亲近'],
      camera:['温柔地接受镜头记录','像轻松日常自拍一样面对镜头','有自然镜头感但不刻意'],
      expression:'表情柔和甜感，变化细腻不过分可爱',
      colors:['奶油白','浅粉','烟粉','米白','雾蓝','米杏'],
      outfitWeights:{dress:30,top_skirt:30,set:16,top_long_skirt:12,top_pants:8,top_shorts:4},
      topIds:['cropped_boat_knit','button_cardigan','soft_wrap_knit','fitted_square_rib','fitted_collar_knit'],
      skirtIds:['a_line_mini','soft_knit_mini','straight_mini','light_slit_mini'],
      dressIds:['square_fitted_dress','soft_ruched_dress','waist_sleeveless_dress','short_sleeve_fitted_dress'],
      signatureGroups:['heart','face_frame','cute'],
      preferredArcs:['sweet_to_playful','soft_to_bright'],
      normalWeights:{pose:22,groom:24,look:16,hand:24,distance:4,body:10},
      humanNoiseRate:.2, secondSignatureRate:.18, expressionCount:[1,2], reactionRate:.72
    },
    {
      id:'sweet_cool_spicy', name:'甜酷轻辣', density:'medium',
      states:['甜酷、有反差','前段偏冷、后段更俏皮','自信、带一点坏笑感'],
      camera:['熟悉镜头但不会一直笑','带一点短视频里的反差营业感','直接面对镜头并保留一点酷感'],
      expression:'表情有冷甜反差，中后段会出现更明显的笑意',
      colors:['黑色','深灰','奶油白','浅粉','浅灰','雾蓝'],
      outfitWeights:{top_skirt:30,top_pants:18,dress:22,top_shorts:15,set:10,top_long_skirt:5},
      topIds:['fitted_one_shoulder','cropped_boat_knit','simple_asym_neck','fitted_offshoulder_short','micro_fitted_tee'],
      skirtIds:['straight_mini','light_slit_mini','a_line_mini','narrow_mini'],
      pantsIds:['fitted_flare_jeans','high_waist_fitted_pants','dark_straight_jeans'],
      dressIds:['one_shoulder_dress','offshoulder_fitted_dress','square_fitted_dress'],
      signatureGroups:['cool','v_sign','cute','heart'],
      preferredArcs:['cold_to_sweet','mature_to_cute'],
      normalWeights:{pose:24,groom:14,look:22,hand:18,distance:8,body:14},
      humanNoiseRate:.2, secondSignatureRate:.34, expressionCount:[1,2], reactionRate:.74
    },
    {
      id:'light_mature_city', name:'都市轻熟', density:'medium',
      states:['自信、从容','轻熟、稳定','干净、成熟'],
      camera:['稳定而直接地面对镜头','像被认真拍摄但依然日常','有成熟镜头感但不过度营业'],
      expression:'表情偏克制，眼神稳定，变化细而明确',
      colors:['黑色','深灰','米白','酒红','咖色','巧克力棕'],
      outfitWeights:{top_skirt:26,top_pants:22,dress:24,top_long_skirt:16,set:8,top_shorts:4},
      topIds:['fitted_square_rib','fitted_collar_knit','soft_wrap_knit','light_v_knit','simple_asym_neck'],
      skirtIds:['straight_mini','narrow_mini','light_slit_mini','soft_knit_mini'],
      pantsIds:['fitted_flare_jeans','high_waist_fitted_pants','simple_straight_pants'],
      dressIds:['square_fitted_dress','rib_bodycon_dress','one_shoulder_dress','waist_sleeveless_dress'],
      signatureGroups:['mature','cool'],
      preferredArcs:['mature_to_cute','relaxed_to_sexy','cold_to_sweet'],
      normalWeights:{pose:25,groom:18,look:24,hand:10,distance:6,body:17},
      humanNoiseRate:.08, secondSignatureRate:.08, expressionCount:[1,1], reactionRate:.45
    },
    {
      id:'subtle_sexy_daily', name:'日常轻性感', density:'medium',
      states:['从容、轻性感','松弛、有女人味','自然、自信'],
      camera:['更长时间稳定看向镜头','自然展示自己并保持克制镜头感','像日常自拍里很会展示身形的人'],
      expression:'表情克制，半笑和直接眼神占比更高',
      colors:['黑色','米白','酒红','巧克力棕','深灰','咖色'],
      outfitWeights:{dress:32,top_skirt:24,top_pants:14,top_long_skirt:10,top_shorts:12,set:8},
      topIds:['thin_strap_knit','fitted_square_rib','fitted_offshoulder_short','fitted_one_shoulder','light_v_knit','fitted_halter'],
      skirtIds:['bodycon_knit_mini','narrow_mini','light_slit_mini','straight_mini'],
      pantsIds:['fitted_flare_jeans','high_waist_fitted_pants'],
      dressIds:['strap_waist_dress','offshoulder_fitted_dress','one_shoulder_dress','rib_bodycon_dress'],
      signatureGroups:['mature'],
      preferredArcs:['relaxed_to_sexy','cold_to_sweet'],
      normalWeights:{pose:20,groom:15,look:17,hand:18,distance:12,body:18},
      humanNoiseRate:.08, secondSignatureRate:.08, expressionCount:[1,1], reactionRate:.36
    },
    {
      id:'cool_clean_minimal', name:'清冷极简', density:'low',
      states:['清冷、克制','干净、疏离','冷静、稳定'],
      camera:['直视镜头的时间更长','以稳定眼神为主导面对镜头','像极简人物自拍视频一样干净直接'],
      expression:'表情变化较少，眼神和轻微挑眉更重要',
      colors:['黑色','白色','浅灰','深灰','深蓝'],
      outfitWeights:{top_pants:28,top_long_skirt:26,dress:22,top_skirt:16,set:6,top_shorts:2},
      topIds:['simple_asym_neck','fitted_sleeveless_round','fitted_sleeveless_knit','fitted_one_shoulder','fitted_halter'],
      skirtIds:['straight_mini','narrow_mini'],
      longSkirtIds:['straight_long_skirt','slit_long_skirt','fitted_knit_long_skirt'],
      pantsIds:['dark_straight_jeans','simple_straight_pants','high_waist_fitted_pants'],
      dressIds:['one_shoulder_dress','waist_sleeveless_dress','square_fitted_dress'],
      signatureGroups:['cool','mature'],
      preferredArcs:['cold_to_sweet'],
      normalWeights:{pose:28,groom:10,look:32,hand:6,distance:6,body:18},
      humanNoiseRate:0, secondSignatureRate:.03, expressionCount:[0,1], reactionRate:.18
    },
    {
      id:'gentle_elegant', name:'温柔气质', density:'low',
      states:['温柔、安静','柔和、有气质','从容、舒缓'],
      camera:['安静地接受镜头记录','像被认真但温柔地拍摄','镜头关系自然且不急着表现'],
      expression:'表情变化细，笑意轻，动作节奏柔和',
      colors:['米白','雾蓝','米杏','烟粉','浅灰','奶油白'],
      outfitWeights:{top_long_skirt:26,dress:30,top_skirt:20,top_pants:12,set:10,top_shorts:2},
      topIds:['soft_wrap_knit','button_cardigan','cropped_boat_knit','fitted_square_rib','light_v_knit'],
      skirtIds:['a_line_mini','soft_knit_mini','straight_mini'],
      longSkirtIds:['soft_drape_long_skirt','straight_long_skirt','fitted_knit_long_skirt'],
      dressIds:['square_fitted_dress','soft_ruched_dress','waist_sleeveless_dress','short_sleeve_fitted_dress'],
      signatureGroups:['face_frame','mature'],
      preferredArcs:['soft_to_bright','cold_to_sweet'],
      normalWeights:{pose:24,groom:25,look:20,hand:15,distance:3,body:13},
      humanNoiseRate:.08, secondSignatureRate:.05, expressionCount:[1,1], reactionRate:.34
    },
    {
      id:'lazy_frenchish', name:'慵懒法式感', density:'low',
      states:['慵懒、松散','不经意、松弛','慢节奏、从容'],
      camera:['不急着看镜头，最后再把注意力收回来','像不经意被镜头记录到','以重心和姿态带动镜头关系'],
      expression:'半笑和松弛眼神为主，表情变化慢',
      colors:['酒红','米白','黑色','咖色','奶油白','巧克力棕'],
      outfitWeights:{dress:34,top_skirt:22,top_long_skirt:16,top_pants:14,set:8,top_shorts:6},
      topIds:['fitted_square_rib','thin_strap_knit','soft_wrap_knit','light_v_knit','cropped_boat_knit'],
      skirtIds:['narrow_mini','soft_knit_mini','straight_mini'],
      longSkirtIds:['soft_drape_long_skirt','fitted_knit_long_skirt','slit_long_skirt'],
      dressIds:['strap_waist_dress','square_fitted_dress','rib_bodycon_dress','soft_ruched_dress'],
      signatureGroups:['mature','face_frame'],
      preferredArcs:['relaxed_to_sexy','cold_to_sweet'],
      normalWeights:{pose:32,groom:18,look:20,hand:10,distance:5,body:15},
      humanNoiseRate:.12, secondSignatureRate:.04, expressionCount:[1,1], reactionRate:.28
    },
    {
      id:'refined_rich_daily', name:'精致千金日常', density:'medium',
      states:['精致、克制','轻微矜持、从容','干净、娇贵'],
      camera:['对镜头有意识但保持一点矜持','像精致日常记录而不是正式摆拍','自然面对镜头并保持细节感'],
      expression:'浅笑、假装淡定和细小表情变化更常见',
      colors:['奶油白','米白','浅粉','烟粉','米杏','浅灰'],
      outfitWeights:{top_skirt:30,dress:28,set:20,top_long_skirt:10,top_pants:8,top_shorts:4},
      topIds:['button_cardigan','thin_strap_knit','cropped_boat_knit','fitted_square_rib','soft_wrap_knit'],
      skirtIds:['a_line_mini','narrow_mini','soft_knit_mini','straight_mini'],
      dressIds:['strap_waist_dress','square_fitted_dress','waist_sleeveless_dress','soft_ruched_dress'],
      signatureGroups:['face_frame','mature','heart'],
      preferredArcs:['soft_to_bright','mature_to_cute'],
      normalWeights:{pose:20,groom:32,look:16,hand:18,distance:3,body:11},
      humanNoiseRate:.08, secondSignatureRate:.12, expressionCount:[1,2], reactionRate:.48
    },
    {
      id:'sporty_sweet_spicy', name:'运动甜辣', density:'high',
      states:['明亮、活力','健康、轻快','年轻、有弹性'],
      camera:['直接而轻快地给镜头反馈','像运动系社媒自拍视频一样自然','熟悉镜头且动作反应更快'],
      expression:'笑意更明亮，眼神直接，整体更有活力',
      colors:['白色','浅灰','黑色','深蓝','雾蓝','浅粉'],
      outfitWeights:{top_shorts:30,top_skirt:28,top_pants:16,set:16,dress:8,top_long_skirt:2},
      topIds:['micro_fitted_tee','fitted_sleeveless_round','fitted_sleeveless_knit','fitted_halter','fitted_one_shoulder'],
      skirtIds:['a_line_mini','straight_mini','denim_mini'],
      shortsIds:['high_waist_fitted_shorts','high_waist_denim_shorts','simple_casual_shorts'],
      pantsIds:['fitted_flare_jeans','dark_straight_jeans'],
      dressIds:['waist_sleeveless_dress','short_sleeve_fitted_dress'],
      signatureGroups:['v_sign','cute','cool'],
      preferredArcs:['sweet_to_playful','soft_to_bright'],
      normalWeights:{pose:18,groom:8,look:12,hand:20,distance:22,body:20},
      humanNoiseRate:.18, secondSignatureRate:.28, expressionCount:[2,2], reactionRate:.8
    },
    {
      id:'high_energy_creator', name:'高能营业型博主', density:'high',
      states:['高能、熟练','镜头感强、变化丰富','主动营业、反馈明确'],
      camera:['非常熟悉镜头并持续给出反馈','像高频更新的社媒博主一样自然切换状态','有明显对镜头表演意识但保持真人感'],
      expression:'表情变化最丰富，动作之间会自然给出反应',
      colors:['黑色','奶油白','浅灰','浅粉','酒红','雾蓝'],
      outfitWeights:{top_skirt:28,top_shorts:20,dress:20,set:15,top_pants:12,top_long_skirt:5},
      topIds:['fitted_square_rib','cropped_boat_knit','fitted_one_shoulder','micro_fitted_tee','fitted_halter','button_cardigan'],
      skirtIds:['a_line_mini','straight_mini','light_slit_mini','soft_knit_mini'],
      shortsIds:['high_waist_denim_shorts','high_waist_fitted_shorts'],
      dressIds:['square_fitted_dress','one_shoulder_dress','short_sleeve_fitted_dress'],
      signatureGroups:['heart','v_sign','face_frame','cute','cool'],
      preferredArcs:['sweet_to_playful','mature_to_cute','cold_to_sweet','soft_to_bright'],
      normalWeights:{pose:14,groom:12,look:10,hand:28,distance:12,body:24},
      humanNoiseRate:.28, secondSignatureRate:.68, expressionCount:[2,3], reactionRate:1
    }
  ];

  const TOPS = [
    {id:'fitted_square_rib',name:'修身方领罗纹短袖上衣',materials:['细罗纹针织','微弹面料'],tags:['daily','mature','sexy'],flags:['fitted','square_neck']},
    {id:'cropped_boat_knit',name:'短款船领针织上衣',materials:['柔软针织','细罗纹针织'],tags:['sweet','social'],flags:['cropped']},
    {id:'fitted_one_shoulder',name:'贴身斜肩短袖上衣',materials:['微弹面料','轻薄贴身面料'],tags:['cool','spicy'],flags:['fitted','shoulder']},
    {id:'thin_strap_knit',name:'细肩带针织吊带',materials:['细罗纹针织','柔软针织'],tags:['sexy','refined'],flags:['fitted','strap','shoulder']},
    {id:'offshoulder_long_knit',name:'微露肩长袖针织上衣',materials:['柔软针织','细罗纹针织'],tags:['gentle','sexy'],flags:['long_sleeve','shoulder']},
    {id:'fitted_collar_knit',name:'修身翻领短袖针织衫',materials:['柔软针织','微弹面料'],tags:['mature','refined'],flags:['fitted','collar']},
    {id:'button_cardigan',name:'短款排扣小开衫',materials:['柔软针织','细罗纹针织'],tags:['sweet','refined'],flags:['cardigan','cropped','sleeve']},
    {id:'soft_wrap_knit',name:'柔软裹身式针织上衣',materials:['柔软针织','轻薄贴身面料'],tags:['gentle','french'],flags:['fitted','wrap']},
    {id:'fitted_sleeveless_round',name:'修身无袖圆领针织上衣',materials:['细罗纹针织','微弹面料'],tags:['clean','sporty'],flags:['fitted','sleeveless']},
    {id:'simple_asym_neck',name:'简洁不对称领口上衣',materials:['微弹面料','柔软针织'],tags:['cool','mature'],flags:['asym','shoulder']},
    {id:'fitted_offshoulder_short',name:'修身一字肩短袖上衣',materials:['微弹面料','细罗纹针织'],tags:['spicy','social'],flags:['fitted','shoulder']},
    {id:'fitted_halter',name:'简洁挂脖修身上衣',materials:['轻薄贴身面料','微弹面料'],tags:['sporty','spicy'],flags:['fitted','halter','shoulder']},
    {id:'micro_fitted_tee',name:'微短款修身T恤',materials:['柔软棉质','微弹面料'],tags:['daily','sporty','social'],flags:['fitted','cropped']},
    {id:'fitted_sleeveless_knit',name:'修身无袖针织背心',materials:['细罗纹针织','柔软针织'],tags:['clean','daily'],flags:['fitted','sleeveless']},
    {id:'light_v_knit',name:'轻薄贴身V领针织上衣',materials:['轻薄贴身面料','柔软针织'],tags:['mature','french'],flags:['fitted','v_neck']}
  ];

  const SHORT_SKIRTS = [
    {id:'a_line_mini',name:'高腰A字迷你裙',materials:['微弹面料','柔软棉质'],flags:['high_waist']},
    {id:'bodycon_knit_mini',name:'轻微包臀针织短裙',materials:['细罗纹针织','柔软针织'],flags:['high_waist','fitted']},
    {id:'straight_mini',name:'高腰直筒短裙',materials:['微弹面料','柔软垂感面料'],flags:['high_waist']},
    {id:'denim_mini',name:'牛仔短裙',materials:['柔软牛仔'],flags:['high_waist','denim']},
    {id:'light_slit_mini',name:'简约微开衩半身短裙',materials:['微弹面料','柔软垂感面料'],flags:['high_waist','slit']},
    {id:'pleated_light_mini',name:'高腰轻百褶感短裙',materials:['柔软垂感面料','柔软棉质'],flags:['high_waist']},
    {id:'soft_knit_mini',name:'柔软针织短裙',materials:['柔软针织','细罗纹针织'],flags:['high_waist']},
    {id:'narrow_mini',name:'高腰窄版短裙',materials:['微弹面料','柔软垂感面料'],flags:['high_waist','fitted']}
  ];

  const LONG_SKIRTS = [
    {id:'slit_long_skirt',name:'简约微开衩半身长裙',materials:['柔软垂感面料','柔软针织'],flags:['high_waist','slit','long']},
    {id:'soft_drape_long_skirt',name:'柔软垂感长裙',materials:['柔软垂感面料','轻薄雪纺'],flags:['high_waist','long']},
    {id:'straight_long_skirt',name:'高腰直筒长裙',materials:['柔软垂感面料','微弹面料'],flags:['high_waist','long']},
    {id:'fitted_knit_long_skirt',name:'修身针织长裙',materials:['柔软针织','细罗纹针织'],flags:['high_waist','long','fitted']}
  ];

  const PANTS = [
    {id:'fitted_flare_jeans',name:'高腰修身微喇牛仔裤',materials:['柔软牛仔','微弹面料'],flags:['high_waist','pocket','fitted']},
    {id:'dark_straight_jeans',name:'高腰直筒牛仔裤',materials:['柔软牛仔'],flags:['high_waist','pocket','denim']},
    {id:'soft_wide_pants',name:'柔软垂感阔腿裤',materials:['柔软垂感面料'],flags:['high_waist','pocket']},
    {id:'high_waist_fitted_pants',name:'高腰修身长裤',materials:['微弹面料','柔软垂感面料'],flags:['high_waist','pocket','fitted']},
    {id:'simple_straight_pants',name:'简约直筒长裤',materials:['柔软垂感面料','柔软棉质'],flags:['high_waist','pocket']}
  ];

  const SHORTS = [
    {id:'high_waist_fitted_shorts',name:'高腰修身短裤',materials:['微弹面料','柔软棉质'],flags:['high_waist','pocket','fitted']},
    {id:'high_waist_denim_shorts',name:'高腰牛仔短裤',materials:['柔软牛仔'],flags:['high_waist','pocket','denim']},
    {id:'simple_casual_shorts',name:'简洁休闲短裤',materials:['柔软棉质','柔软垂感面料'],flags:['high_waist','pocket']}
  ];

  const DRESSES = [
    {id:'square_fitted_dress',name:'方领修身针织短裙',materials:['柔软针织','细罗纹针织'],flags:['dress','fitted','square_neck']},
    {id:'strap_waist_dress',name:'细肩带收腰连衣裙',materials:['轻薄贴身面料','细腻缎面'],flags:['dress','fitted','strap','shoulder']},
    {id:'soft_ruched_dress',name:'轻微褶皱修身连衣裙',materials:['微弹面料','柔软针织'],flags:['dress','fitted']},
    {id:'short_sleeve_fitted_dress',name:'短袖贴身针织连衣裙',materials:['细罗纹针织','柔软针织'],flags:['dress','fitted']},
    {id:'offshoulder_fitted_dress',name:'一字肩修身连衣裙',materials:['微弹面料','柔软针织'],flags:['dress','fitted','shoulder']},
    {id:'sleeveless_square_dress',name:'无袖方领连衣裙',materials:['微弹面料','柔软垂感面料'],flags:['dress','square_neck','sleeveless']},
    {id:'one_shoulder_dress',name:'斜肩修身连衣裙',materials:['微弹面料','柔软针织'],flags:['dress','fitted','shoulder']},
    {id:'strap_fitted_dress',name:'吊带修身连衣裙',materials:['细罗纹针织','轻薄贴身面料'],flags:['dress','fitted','strap','shoulder']},
    {id:'rib_bodycon_dress',name:'罗纹针织包身连衣裙',materials:['细罗纹针织','柔软针织'],flags:['dress','fitted']},
    {id:'waist_sleeveless_dress',name:'收腰无袖短裙',materials:['微弹面料','柔软垂感面料'],flags:['dress','sleeveless']}
  ];

  const COLORS = ['黑色','白色','奶油白','米白','浅灰','深灰','米杏','浅粉','烟粉','酒红','咖色','巧克力棕','深蓝','雾蓝','墨绿'];
  const MATERIAL_FALLBACK = ['柔软针织','细罗纹针织','微弹面料','柔软棉质','轻薄贴身面料','柔软牛仔','柔软垂感面料'];
  const CLOTHES_BLACKLIST = ['女仆','JK','护士','空姐','职业 cosplay','舞台装','礼服','Y2K','漆皮','PVC','亮片','乳胶','大面积透视','网袜','内衣'];

  const ACTION_POOLS = {
    pose:[
      a('pose_natural','自然调整站姿','pose',['daily'],false,true),
      a('pose_side_return','轻微侧身后重新回正','pose',['daily','mature'],false,true),
      a('pose_weight_shift','把身体重心自然换到另一侧','pose',['daily','french'],false,true),
      a('pose_leg_forward','一条腿稍微向前伸出，让站姿更松弛','pose',['daily','social'],false,true),
      a('pose_cross_stance','双腿从平行站自然换成交叉站','pose',['mature','refined'],false,true),
      a('pose_shoulder_offset','肩膀自然偏向一边，形成不对称站姿','pose',['mature','cool'],false,true),
      a('pose_s_curve','身体形成轻微S形曲线后自然放松','pose',['sexy','mature'],false,true),
      a('pose_forward_restore','身体略微前倾后重新站直','pose',['social','daily'],false,true),
      a('pose_three_quarter','身体转成轻微三分之二侧身，再自然回到更正面的角度','pose',['cool','mature'],false,true),
      a('pose_back_to_front','先把身体稍微偏离镜头，再慢慢转回正面','pose',['french','gentle'],false,true),
      a('pose_hip_shift','腰胯重心轻轻换边，让身体线条出现自然变化','pose',['sexy','mature'],false,true),
      a('pose_relax_shoulders','先放松肩膀，再重新找到更舒服的站姿','pose',['daily','girlfriend'],false,true),
      a('pose_soft_cross','双腿自然交叉一下，再换回更放松的站姿','pose',['sweet','refined'],false,true),
      a('pose_one_side','身体明显偏向一侧停留片刻，再把重心慢慢收回来','pose',['french','cool'],false,true),
      a('pose_slight_turn_hold','轻轻转向一侧停留片刻，再把身体角度调整回来','pose',['mature','gentle'],false,true)
    ],
    body:[
      a('body_waist','一只手自然扶在腰侧，让身体线条更明确','body',['mature','sexy'],false,true),
      a('body_asym','一只手放在腰侧，另一只手自然垂下形成不对称姿态','body',['mature','cool'],false,true),
      a('body_arm_cross','双臂在身前轻轻交叠后再自然放开','body',['mature','cool'],false,true),
      a('body_hands_back','双手短暂背到身后，让上半身自然舒展开','body',['sweet','daily'],false,true),
      a('body_front_fold','双手短暂在身前交叠，再放回更自然的位置','body',['gentle','refined'],false,true),
      a('body_neck','一只手轻触颈侧片刻后自然放下','body',['sexy','mature'],true,false),
      a('body_collarbone','一只手停留在锁骨附近片刻，再自然收回','body',['sexy','gentle'],true,false),
      a('body_chin','一只手轻托下巴片刻，再慢慢放下','body',['mature','refined'],true,false),
      a('body_face_side','一只手自然托住脸侧片刻，再放回身侧','body',['sweet','gentle'],true,false),
      a('body_arm_support','一只手撑在另一只手臂上形成短暂的不对称姿态','body',['mature','cool'],false,true),
      a('body_side_line','身体转成侧身，让肩腰线条更清楚，再重新放松','body',['sexy','mature'],false,true),
      a('body_straighten','从松弛站姿慢慢站得更挺一点，再恢复自然状态','body',['mature','refined'],false,true)
    ],
    groom:[
      a('groom_hair_shoulder','将一侧头发顺到肩后，再自然放下手','groom',['daily','gentle'],true,false),
      a('groom_hair_ear','抬手整理耳边碎发，随后自然收回手','groom',['daily','sweet'],true,false),
      a('groom_collar','轻轻整理一下衣领，完成后抬眼重新看向镜头','groom',['mature','refined'],true,false),
      a('groom_sleeve','轻轻拉一下袖口，再把手放回自然位置','groom',['refined','daily'],false,false,['long_sleeve','sleeve']),
      a('groom_cardigan','轻轻调整开衫下摆，再自然放松站好','groom',['refined','sweet'],false,false,['cardigan']),
      a('groom_necklace','手指短暂碰一下项链吊坠，随后自然放下','groom',['mature','refined'],true,false,['necklace']),
      a('groom_pocket','一只手短暂插进口袋，再自然抽出来','groom',['cool','sporty'],false,false,['pocket']),
      a('groom_shoulder','轻轻整理肩侧的衣料，再重新面对镜头','groom',['sexy','refined'],true,false,['shoulder']),
      a('groom_hem','轻轻整理一下上衣下摆，再恢复放松站姿','groom',['daily','social'],false,false),
      a('groom_hair_back','把肩前的一束头发轻轻拨到身后，再自然放下手','groom',['french','mature'],true,false),
      a('groom_hair_both','双手快速整理一下两侧头发，随后把手放下','groom',['social','creator'],true,false)
    ],
    hand:[
      a('hand_front','双手短暂在身前自然交叠，再放开','hand',['gentle','daily'],false,false),
      a('hand_back','双手短暂背到身后，再回到自然位置','hand',['sweet','daily'],false,true),
      a('hand_waist','一只手自然扶腰，另一只手保持放松','hand',['mature','sexy'],false,true),
      a('hand_chin','一只手轻托下巴片刻，再慢慢放下','hand',['mature','refined'],true,false),
      a('hand_face','一只手轻贴脸侧片刻，再自然移开','hand',['sweet','social'],true,false),
      a('hand_neck','一只手轻触颈侧，短暂停留后放下','hand',['sexy','gentle'],true,false),
      a('hand_collarbone','一只手停在锁骨附近片刻，再自然收回','hand',['sexy','mature'],true,false),
      a('hand_arm_open','双臂轻轻交叠一下，再自然打开','hand',['mature','cool'],false,true),
      a('hand_one_up','一只手自然抬到胸前片刻，再慢慢放下','hand',['daily','social'],false,false),
      a('hand_relax_switch','双手先放松垂下，再换成一个更有层次的不对称手位','hand',['creator','mature'],false,true),
      a('hand_pocket_hold','一只手放进口袋，另一只手自然垂下','hand',['cool','sporty'],false,true,['pocket']),
      a('hand_necklace_hold','一只手轻轻碰着项链吊坠片刻，再放下','hand',['refined','mature'],true,false,['necklace'])
    ],
    look:[
      a('look_away_back','短暂看向旁边，再重新把视线收回镜头','look',['daily','girlfriend'],false,false),
      a('look_direct','稳定直视镜头片刻，再自然放松眼神','look',['cool','mature'],false,false),
      a('look_side_slow','先看向侧边，再缓慢转回镜头','look',['mature','french'],false,false),
      a('look_shoulders','身体略微侧转，同时从肩侧重新看回镜头','look',['cool','mature'],false,true),
      a('look_lower_return','视线短暂落下，再抬眼重新看向镜头','look',['gentle','refined'],false,false),
      a('look_candid','像突然注意到镜头一样看回来，再自然放松','look',['girlfriend','daily'],false,false),
      a('look_hold_then_off','先直接看镜头片刻，再把视线轻轻移开','look',['cool','sexy'],false,false),
      a('look_return_smile','看向旁边一瞬，再回看镜头保持更明确的眼神','look',['sweet','daily'],false,false),
      a('look_slow_focus','眼神先保持松弛，再逐渐集中到镜头上','look',['french','cool'],false,false),
      a('look_quick_feedback','快速看一眼镜头，再把注意力自然转回身体姿态','look',['social','creator'],false,false)
    ],
    distance:[
      a('distance_forward','向镜头靠近小半步，随后停在更近的位置','distance',['social','sexy'],false,true),
      a('distance_back','向后退小半步，再重新稳定站好','distance',['social','sporty'],false,true),
      a('distance_forward_back','身体略微向镜头靠近，再自然退回原位','distance',['social','daily'],false,true),
      a('distance_lean','上半身轻轻靠近镜头片刻，再重新站直','distance',['social','sexy'],false,true),
      a('distance_bounce','站姿轻快地换一次重心，让身体出现一点弹性变化','distance',['sporty','creator'],false,true),
      a('distance_step_side','向侧边轻轻挪半步，再把身体重新朝向镜头','distance',['sporty','social'],false,true)
    ]
  };

  const SIGNATURES = [
    s('heart_finger','在脸旁做一个小型手指爱心，短暂停留后自然放下','heart',['playful_social','sweet_soft','sweet_cool_spicy','refined_rich_daily','high_energy_creator'],true),
    s('heart_close','把手指爱心稍微靠近镜头展示一下，再自然收回','heart',['playful_social','sweet_soft','high_energy_creator'],true),
    s('heart_big','双手在胸前组成一个大爱心，停留片刻后放下','heart',['playful_social','sweet_soft','high_energy_creator'],false),
    s('heart_face_both','双手在脸旁组成一个轻巧爱心，随后自然放开','heart',['playful_social','sweet_soft','refined_rich_daily'],true),
    s('heart_head','双手在头顶组成爱心，完成后自然放下','heart',['playful_social','high_energy_creator'],true),
    s('heart_half','一只手朝镜头做出半颗爱心，短暂停留后收回','heart',['playful_social','sweet_soft','high_energy_creator'],true),

    s('v_face','在脸侧比一个单手剪刀手，停留片刻后自然放下','v_sign',['playful_social','sweet_cool_spicy','sporty_sweet_spicy','high_energy_creator'],true),
    s('v_eye','在一只眼睛旁边比出剪刀手，再自然移开','v_sign',['playful_social','sweet_cool_spicy','high_energy_creator'],true),
    s('v_head','在头侧做一个轻快剪刀手，短暂停留后放下','v_sign',['playful_social','sporty_sweet_spicy','high_energy_creator'],true),
    s('v_chin','在下巴附近做一个横向剪刀手，随后自然收回','v_sign',['playful_social','high_energy_creator'],true),
    s('v_double','双手在左右脸旁各做一个剪刀手，停留片刻后放下','v_sign',['playful_social','high_energy_creator'],true),

    s('face_chin_one','一只手轻托下巴并直接看向镜头，短暂停留后放下','face_frame',['sweet_soft','gentle_elegant','refined_rich_daily','soft_daily_girlfriend'],true),
    s('face_chin_two','双手轻托下巴片刻，再自然放开','face_frame',['playful_social','sweet_soft','refined_rich_daily'],true),
    s('face_flower','双手在下巴下面形成轻巧花朵姿势，停留片刻后放下','face_frame',['playful_social','sweet_soft','high_energy_creator'],true),
    s('face_side','一只手轻贴脸侧，保持片刻后自然移开','face_frame',['sweet_soft','gentle_elegant','refined_rich_daily'],true),
    s('face_cheeks','双手轻捧两侧脸颊片刻，再自然放下','face_frame',['playful_social','sweet_soft'],true),
    s('face_point','食指轻点一下脸颊，随后自然收回','face_frame',['playful_social','sweet_soft','high_energy_creator'],true),
    s('face_half_frame','手掌在脸侧形成简单半框，短暂停留后放下','face_frame',['sweet_soft','refined_rich_daily','high_energy_creator'],true),

    s('cute_cat','两只手短暂做一个小猫爪姿势，随后自然放下','cute',['playful_social','sweet_soft','high_energy_creator'],true),
    s('cute_fists','双拳轻轻停在脸侧片刻，再放回自然位置','cute',['playful_social','sweet_cool_spicy','high_energy_creator'],true),
    s('cute_wave','一只手轻轻做一个小幅度招手，再自然放下','cute',['soft_daily_girlfriend','playful_social','sweet_soft','high_energy_creator'],true),
    s('cute_open','双手在胸前轻轻合拢再打开，随后放松','cute',['playful_social','sweet_soft','sporty_sweet_spicy','high_energy_creator'],false),
    s('cute_cheek','轻轻鼓一下脸颊，随后马上放松表情','cute',['playful_social','sweet_soft','sweet_cool_spicy','high_energy_creator'],true),

    s('mature_shh','食指短暂放在嘴唇前做一个很轻的“嘘”手势，随后放下','mature',['light_mature_city','cool_clean_minimal','lazy_frenchish','subtle_sexy_daily'],true),
    s('mature_chin','一只手轻托下巴同时直接看向镜头，短暂停留后放下','mature',['light_mature_city','subtle_sexy_daily','gentle_elegant','lazy_frenchish','refined_rich_daily'],true),
    s('mature_arm','一只手撑在另一只手臂上形成不对称姿态，停留片刻后放松','mature',['light_mature_city','cool_clean_minimal','refined_rich_daily'],false),
    s('mature_cross','双臂短暂交叠后慢慢放开','mature',['light_mature_city','cool_clean_minimal','lazy_frenchish'],false),
    s('mature_turn','身体转成侧身，再回头直接看向镜头','mature',['light_mature_city','subtle_sexy_daily','lazy_frenchish'],false),
    s('mature_neck','单手放到颈侧，随后自然移到肩部再放下','mature',['subtle_sexy_daily','light_mature_city','lazy_frenchish'],true),
    s('mature_asym','一只手放在腰侧，另一只手自然垂下形成明显不对称姿态','mature',['light_mature_city','subtle_sexy_daily','cool_clean_minimal'],false),
    s('mature_necklace','手指轻轻绕一下项链吊坠，随后自然松开','mature',['light_mature_city','refined_rich_daily','lazy_frenchish'],true),
    s('mature_collar','轻轻整理衣领后抬眼看向镜头','mature',['light_mature_city','refined_rich_daily','cool_clean_minimal'],true),

    s('cool_salute','一只手做一个很随意的小型敬礼，随后马上放松','cool',['sweet_cool_spicy','cool_clean_minimal','sporty_sweet_spicy','high_energy_creator'],true),
    s('cool_eye_frame','食指与拇指在眼睛附近做一个简单框，停留片刻后放下','cool',['sweet_cool_spicy','cool_clean_minimal','high_energy_creator'],true),
    s('cool_point','轻微指向镜头一下，随后马上放松手臂','cool',['sweet_cool_spicy','sporty_sweet_spicy','high_energy_creator'],false),
    s('cool_finger_gun','单手做一个短暂手枪姿势，随后立即放松','cool',['sweet_cool_spicy','cool_clean_minimal','high_energy_creator'],false),
    s('cool_pocket','单手插袋，另一只手轻微抬起形成松弛酷感姿态','cool',['cool_clean_minimal','sporty_sweet_spicy','sweet_cool_spicy'],false),
    s('cool_side_eye','侧眼看向镜头并轻轻挑一下眉，随后恢复自然表情','cool',['sweet_cool_spicy','cool_clean_minimal','high_energy_creator'],true),
    s('cool_body_turn','身体侧转但脸保持看向镜头，停留片刻后放松','cool',['cool_clean_minimal','light_mature_city','sweet_cool_spicy'],false)
  ];

  const EXPRESSIONS = {
    sweet:[
      '原本自然微笑，随后笑容变得更明显',
      '轻轻鼓一下脸颊后自己笑出来',
      '短暂抿嘴，随后变成更明亮的笑容',
      '眨眼后轻轻wink一下，再露出笑容',
      '轻轻皱一下鼻子后露出笑容',
      '突然睁大一点眼睛，随后笑出来'
    ],
    playful:[
      '假装严肃一瞬间，随后突然笑出来',
      '轻微噘嘴一下，接着忍不住笑',
      '轻轻挑一下眉，随后嘴角扬起',
      '侧眼看镜头一瞬，随后突然笑出来',
      '短暂收住笑意，下一秒又明显笑开'
    ],
    mature:[
      '平静直视后露出很轻的半笑',
      '浅笑之后嘴角慢慢收回',
      '稍微挑眉并保持直接眼神',
      '先看向侧边，再缓慢转回镜头',
      '微微眯眼后露出很淡的笑'
    ],
    cool:[
      '基本没有笑，后段才出现一点嘴角笑意',
      '冷静直视后轻微挑眉',
      '看向旁边，再回看镜头时眼神更集中',
      '表情保持克制，只在最后稍微放松嘴角'
    ],
    girlfriend:[
      '发现镜头后有一点不好意思地笑',
      '看旁边，再看回来后笑得更明显',
      '像被朋友逗了一下，忍不住笑',
      '刚注意到镜头时稍微愣一下，随后自然笑起来'
    ],
    bright:[
      '眼神突然更亮一点，随后露出明显笑容',
      '快速眨一下眼睛后笑得更开',
      '先保持明亮直视，随后轻快地笑出来'
    ]
  };

  const REACTIONS = {
    playful:[
      '做完这个动作后自己轻轻笑出来',
      '动作结束后轻轻wink一下',
      '完成动作后短暂抿嘴笑',
      '动作做完后轻轻皱一下鼻子再笑出来',
      '完成手势后像觉得有点好玩一样笑一下'
    ],
    mature:[
      '完成动作后嘴角出现非常轻的半笑',
      '动作结束后稍微挑一下眉',
      '做完动作后抬眼重新看向镜头',
      '动作结束后保持一瞬稳定眼神再放松',
      '完成动作后把笑意轻轻收住'
    ],
    girlfriend:[
      '做完动作后像有点不好意思地移开视线',
      '动作结束后自己忍不住笑一下',
      '动作做到一半稍微停顿一下再自然继续',
      '完成动作后看向旁边一瞬，再回到镜头',
      '做完动作后像被朋友逗到一样笑出来'
    ],
    cool:[
      '动作结束后冷静看住镜头片刻',
      '做完动作后轻微挑眉再恢复平静',
      '完成动作后把视线移开一瞬再收回来'
    ],
    bright:[
      '动作结束后笑容明显变亮',
      '完成动作后给镜头一个更直接的明亮眼神'
    ]
  };

  const HUMAN_NOISE = [
    '本来抬起一只手，随后自然换成另一个更舒服的姿态',
    '手放到腰上以后又轻轻调整了一下位置',
    '做完动作后自己轻轻笑了一下再继续',
    '看向旁边一瞬间，然后重新注意镜头',
    '准备进入下一个动作时短暂停顿一下，再继续',
    '刚想抬手又自然放下，随后换成更松弛的姿态',
    '动作做到一半稍微迟疑一下，再顺势完成',
    '站姿调整后又轻轻换了一次重心',
    '表情短暂没绷住笑了一下，再恢复自然状态',
    '手的位置轻轻挪了一下，让姿态显得更舒服'
  ];

  const ENDINGS = [
    e('ending_soft','最后重新自然站好，带着轻微笑意看向镜头结束',['soft_to_bright','sweet_to_playful'],false),
    e('ending_bright','最后笑容更明显地看向镜头，以轻快状态结束',['sweet_to_playful','soft_to_bright'],false),
    e('ending_cool','最后回到正面保持稳定眼神，只留一点很淡的笑意结束',['cold_to_sweet'],false),
    e('ending_direct','最后重新面对镜头，轻轻抬起下巴并保持直接眼神结束',['relaxed_to_sexy','mature_to_cute'],false),
    e('ending_side','最后身体保持轻微侧身，脸重新看向镜头结束',['cold_to_sweet','relaxed_to_sexy'],false),
    e('ending_girlfriend','最后像被镜头逗到一样自然笑一下，再放松结束',['soft_to_bright'],false),
    e('ending_refined','最后把姿态收得更干净，保持浅笑和稳定镜头感结束',['mature_to_cute','cold_to_sweet'],false),
    e('ending_relaxed','最后把重心放松到一侧，带一点半笑自然结束',['relaxed_to_sexy'],false),
    e('ending_playful','最后给镜头一个明显一点的俏皮表情，再自然放松结束',['sweet_to_playful'],true),
    e('ending_eye','最后不做额外手势，只用稳定眼神和很轻的嘴角笑意结束',['cold_to_sweet'],false),
    e('ending_social','最后快速收回动作，直接看向镜头笑一下结束',['sweet_to_playful','soft_to_bright'],false),
    e('ending_mature_cute','最后从克制状态突然露出一点可爱笑意，再自然结束',['mature_to_cute'],false)
  ];

  const TEXT_BLACKLIST = ['或','可以','也可以','例如','任选','随机挑一个'];
  const ACTION_BLACKLIST = ['热舞','舞蹈','大幅甩手','疯狂扭动','TikTok challenge','机械重复'];

  const overlay = $('#promptSettingsOverlay');
  const editor = $('#promptTemplateInput');
  const count = $('#promptTemplateCount');
  const variableDot = $('#promptTemplateVariableDot');
  const variableText = $('#promptTemplateVariableText');
  const saveState = $('#promptTemplateSaveState');

  const lastPersonaName = $('#lastPersonaName');
  const lastPersonaClothes = $('#lastPersonaClothes');
  const lastPersonaPerformance = $('#lastPersonaPerformance');
  const lastPersonaAction = $('#lastPersonaAction');

  function a(id,text,type,tags,faceArea=false,bodyArea=false,requires=[]) {
    return {id,text,type,tags,faceArea,bodyArea,requires};
  }

  function s(id,text,group,personas,faceArea=false) {
    return {id,text,type:'signature',group,personas,faceArea,bodyArea:!faceArea};
  }

  function e(id,text,arcs,faceArea=false) {
    return {id,text,type:'ending',arcs,faceArea,bodyArea:!faceArea};
  }

  function normalizeSeed(value) {
    const n = Math.abs(Math.trunc(Number(value)));
    if (!Number.isFinite(n) || n <= 0) return null;
    return ((n - 1) % 2147483646) + 1;
  }

  function randomSeed() {
    try {
      const values = new Uint32Array(1);
      crypto.getRandomValues(values);
      return (values[0] % 2147483646) + 1;
    } catch {
      return ((Date.now() ^ Math.floor(Math.random() * 2147483647)) >>> 0) % 2147483646 + 1;
    }
  }

  function createRng(seed) {
    let value = seed >>> 0;
    return function() {
      value |= 0;
      value = value + 0x6D2B79F5 | 0;
      let t = Math.imul(value ^ value >>> 15, 1 | value);
      t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t;
      return ((t ^ t >>> 14) >>> 0) / 4294967296;
    };
  }

  function pick(rng, items) {
    return items[Math.floor(rng() * items.length)];
  }

  function weightedPick(rng, entries, getWeight=item => item.weight || 1) {
    const total = entries.reduce((sum,item) => sum + Math.max(0, getWeight(item)), 0);
    if (!total) return entries[0];
    let cursor = rng() * total;
    for (const item of entries) {
      cursor -= Math.max(0, getWeight(item));
      if (cursor <= 0) return item;
    }
    return entries[entries.length - 1];
  }

  function chooseWeightedKey(rng, weights) {
    return weightedPick(
      rng,
      Object.entries(weights).map(([id,weight]) => ({id,weight}))
    ).id;
  }

  function currentTemplate() {
    const saved = localStorage.getItem(PROMPT_TEMPLATE_KEY);
    let value = saved === null ? DEFAULT_VIDEO_PROMPT_TEMPLATE : saved;

    if (!value.includes(ACTION_PLACEHOLDER) && value.includes(PERFORMANCE_PLACEHOLDER)) {
      value = value.replace(PERFORMANCE_PLACEHOLDER, PERFORMANCE_PLACEHOLDER + '\n' + ACTION_PLACEHOLDER);
      localStorage.setItem(PROMPT_TEMPLATE_KEY, value);
    }

    if (value.includes('### 人物表演')) {
      value = value.replace('### 人物表演', '### 人物动作');
      localStorage.setItem(PROMPT_TEMPLATE_KEY, value);
    }

    const oldMotionRule = '动作必须松弛、缓慢、连续，有真实人体重心变化和手臂惯性，不要机械摆拍，不要舞蹈感。';
    const newMotionRule = '动作节奏服从人物动作描述，保持真实人体重心、惯性和连续性，不机械重复，不做舞蹈式大幅扭动。';
    if (value.includes(oldMotionRule)) {
      value = value.replace(oldMotionRule, newMotionRule);
      localStorage.setItem(PROMPT_TEMPLATE_KEY, value);
    }

    if (!localStorage.getItem(PERSONA_MIGRATION_KEY)) {
      localStorage.setItem(PERSONA_MIGRATION_KEY, '1');
    }

    return value;
  }

  function choosePersona(rng) {
    return pick(rng, PERSONAS);
  }

  function getByIds(pool, ids) {
    if (!ids?.length) return pool;
    const set = new Set(ids);
    const selected = pool.filter(item => set.has(item.id));
    return selected.length ? selected : pool;
  }

  function chooseOutfitType(rng, persona) {
    return chooseWeightedKey(rng, persona.outfitWeights);
  }

  function chooseColor(rng, persona) {
    const preferred = persona.colors?.length ? persona.colors : COLORS;
    return pick(rng, preferred);
  }

  function chooseColorPair(rng, persona) {
    const first = chooseColor(rng, persona);
    let second = chooseColor(rng, persona);
    for (let i=0; i<8 && second === first; i++) second = chooseColor(rng, persona);

    if (persona.id === 'sweet_cool_spicy') {
      const dark = ['黑色','深灰'];
      const light = ['奶油白','浅粉','浅灰','雾蓝'];
      return rng() < .5 ? [pick(rng,dark),pick(rng,light)] : [pick(rng,light),pick(rng,dark)];
    }

    return [first,second];
  }

  function chooseMaterial(rng, pieces) {
    const lists = pieces.map(piece => piece.materials || MATERIAL_FALLBACK);
    const shared = lists[0]?.filter(item => lists.every(list => list.includes(item))) || [];
    if (shared.length) return pick(rng,shared);
    const selected = [...new Set(lists.map(list => pick(rng,list)))];
    return selected.length === 1 ? selected[0] : selected.slice(0,2).join('与');
  }

  function outfitPoolFor(type, persona) {
    if (type === 'dress') return getByIds(DRESSES, persona.dressIds);
    if (type === 'top_skirt') return getByIds(SHORT_SKIRTS, persona.skirtIds);
    if (type === 'top_pants') return getByIds(PANTS, persona.pantsIds);
    if (type === 'top_shorts') return getByIds(SHORTS, persona.shortsIds);
    if (type === 'top_long_skirt') return getByIds(LONG_SKIRTS, persona.longSkirtIds);
    return SHORT_SKIRTS;
  }

  function generateClothes(persona, rng) {
    const type = chooseOutfitType(rng, persona);
    const flags = new Set(['necklace']);
    let text = '';
    let signature = '';

    if (type === 'dress') {
      const dress = pick(rng, getByIds(DRESSES, persona.dressIds));
      dress.flags.forEach(flag => flags.add(flag));
      const color = chooseColor(rng, persona);
      const material = chooseMaterial(rng,[dress]);
      text = color + dress.name + '，' + material + '，整体' + personaClothingFinish(persona) + '。';
      signature = [type,dress.id,color,material].join('|');
    } else {
      const top = pick(rng, getByIds(TOPS, persona.topIds));
      top.flags.forEach(flag => flags.add(flag));

      let bottomPool;
      if (type === 'top_skirt' || type === 'set') bottomPool = getByIds(SHORT_SKIRTS, persona.skirtIds);
      else if (type === 'top_pants') bottomPool = getByIds(PANTS, persona.pantsIds);
      else if (type === 'top_shorts') bottomPool = getByIds(SHORTS, persona.shortsIds);
      else bottomPool = getByIds(LONG_SKIRTS, persona.longSkirtIds);

      const bottom = pick(rng,bottomPool);
      bottom.flags.forEach(flag => flags.add(flag));
      const [colorA,colorB] = chooseColorPair(rng,persona);
      const material = chooseMaterial(rng,[top,bottom]);
      text = colorA + top.name + '，搭配' + colorB + bottom.name + '，' + material + '，整体' + personaClothingFinish(persona) + '。';
      signature = [type,top.id,bottom.id,colorA,colorB,material].join('|');
    }

    if (CLOTHES_BLACKLIST.some(term => text.includes(term))) return null;
    if (text.length > 86) return null;

    return {text,type,flags:[...flags],signature};
  }

  function personaClothingFinish(persona) {
    const map = {
      soft_daily_girlfriend:'自然干净、带一点女友感',
      playful_social:'年轻俏皮、有明显社媒感',
      sweet_soft:'柔和甜美、轻盈自然',
      sweet_cool_spicy:'甜酷利落、带一点轻辣反差',
      light_mature_city:'干净利落、轻熟自信',
      subtle_sexy_daily:'显身材但日常克制',
      cool_clean_minimal:'极简清冷、线条干净',
      gentle_elegant:'低饱和柔和、有气质',
      lazy_frenchish:'松弛慵懒、有一点法式轮廓',
      refined_rich_daily:'精致娇贵但保持日常',
      sporty_sweet_spicy:'轻运动甜辣、年轻有活力',
      high_energy_creator:'简洁显身材、网感明确'
    };
    return map[persona.id] || '自然协调';
  }

  function performanceDensityText(persona) {
    if (persona.density === 'low') return '动作密度偏低，每个姿态停留更完整，表情变化克制';
    if (persona.density === 'high') return '动作和表情变化更丰富，切换更快但保持自然连贯';
    return '动作密度自然适中，姿态和表情持续变化但不过分密集';
  }

  function generatePerformance(persona, rng) {
    const state = pick(rng,persona.states);
    const camera = pick(rng,persona.camera);
    const options = [
      '人物面对镜头时整体状态' + state + '，' + camera + '。' + performanceDensityText(persona) + '，' + persona.expression + '。整体表现流畅自然，不机械重复，不过度摆拍，不跳舞。',
      '人物在镜头前呈现' + state + '的整体气质，' + camera + '。' + persona.expression + '，' + performanceDensityText(persona) + '。保持真实人体节奏和镜头关系，不机械重复，不做夸张舞蹈式表演。'
    ];
    const text = pick(rng,options);
    if (text.length < 60 || text.length > 150) return null;
    if (TEXT_BLACKLIST.some(term => text.includes(term))) return null;
    return {text,signature:[persona.id,state,camera].join('|')};
  }

  function actionAvailable(action, outfitFlags) {
    if (!action.requires?.length) return true;
    return action.requires.every(flag => outfitFlags.has(flag));
  }

  function pickNormalAction(rng, persona, type, outfitFlags, usedIds) {
    let pool = (ACTION_POOLS[type] || []).filter(item =>
      actionAvailable(item,outfitFlags) &&
      !usedIds.has(item.id)
    );
    if (!pool.length) {
      pool = Object.values(ACTION_POOLS).flat().filter(item =>
        actionAvailable(item,outfitFlags) &&
        !usedIds.has(item.id)
      );
    }

    const scored = pool.map(item => {
      let weight = 1;
      for (const tag of item.tags || []) {
        if (persona.id.includes(tag)) weight += 2;
        if (persona.signatureGroups.includes(tag)) weight += 1.5;
      }
      if (persona.id === 'soft_daily_girlfriend' && item.tags.includes('daily')) weight += 3;
      if (persona.id === 'lazy_frenchish' && item.tags.includes('french')) weight += 4;
      if (persona.id === 'cool_clean_minimal' && item.tags.includes('cool')) weight += 4;
      if (persona.id === 'subtle_sexy_daily' && item.tags.includes('sexy')) weight += 4;
      if (persona.id === 'playful_social' && item.tags.includes('social')) weight += 4;
      if (persona.id === 'sporty_sweet_spicy' && item.tags.includes('sporty')) weight += 4;
      if (persona.id === 'high_energy_creator' && item.tags.includes('creator')) weight += 4;
      if (persona.id === 'light_mature_city' && item.tags.includes('mature')) weight += 4;
      if (persona.id === 'gentle_elegant' && item.tags.includes('gentle')) weight += 4;
      if (persona.id === 'refined_rich_daily' && item.tags.includes('refined')) weight += 4;
      if (persona.id === 'sweet_soft' && item.tags.includes('sweet')) weight += 4;
      return {item,weight};
    });

    return weightedPick(rng,scored,x => x.weight).item;
  }

  function chooseActionCount(rng, persona) {
    if (persona.density === 'low') {
      return weightedPick(rng,[{value:5,weight:62},{value:6,weight:33},{value:7,weight:5}]).value;
    }
    if (persona.density === 'high') {
      return weightedPick(rng,[{value:5,weight:8},{value:6,weight:37},{value:7,weight:55}]).value;
    }
    return weightedPick(rng,[{value:5,weight:28},{value:6,weight:52},{value:7,weight:20}]).value;
  }

  function chooseArc(rng, persona) {
    return pick(rng,persona.preferredArcs);
  }

  function signatureCandidates(persona, arc) {
    let pool = SIGNATURES.filter(item => item.personas.includes(persona.id) && persona.signatureGroups.includes(item.group));

    if (arc === 'mature_to_cute' && ['light_mature_city','refined_rich_daily','sweet_cool_spicy'].includes(persona.id)) {
      const cutePool = SIGNATURES.filter(item =>
        ['cute','heart','v_sign'].includes(item.group) &&
        ['playful_social','sweet_soft','sweet_cool_spicy','refined_rich_daily','high_energy_creator'].some(id => item.personas.includes(id))
      );
      pool = pool.concat(cutePool.slice(0,6));
    }

    return pool;
  }

  function chooseExpressionPool(persona, arc) {
    if (persona.id === 'cool_clean_minimal') return EXPRESSIONS.cool;
    if (persona.id === 'soft_daily_girlfriend') return EXPRESSIONS.girlfriend;
    if (persona.id === 'playful_social' || persona.id === 'high_energy_creator') return EXPRESSIONS.playful.concat(EXPRESSIONS.bright);
    if (persona.id === 'sweet_soft' || persona.id === 'refined_rich_daily') return EXPRESSIONS.sweet;
    if (persona.id === 'sporty_sweet_spicy') return EXPRESSIONS.bright.concat(EXPRESSIONS.playful);
    if (arc === 'cold_to_sweet') return EXPRESSIONS.cool.concat(EXPRESSIONS.mature);
    if (persona.id === 'light_mature_city' || persona.id === 'subtle_sexy_daily' || persona.id === 'lazy_frenchish') return EXPRESSIONS.mature;
    return EXPRESSIONS.sweet.concat(EXPRESSIONS.mature);
  }

  function chooseReactionPool(persona) {
    if (persona.id === 'cool_clean_minimal') return REACTIONS.cool;
    if (persona.id === 'soft_daily_girlfriend') return REACTIONS.girlfriend;
    if (persona.id === 'playful_social' || persona.id === 'high_energy_creator') return REACTIONS.playful;
    if (persona.id === 'sporty_sweet_spicy') return REACTIONS.bright;
    if (persona.id === 'light_mature_city' || persona.id === 'subtle_sexy_daily' || persona.id === 'lazy_frenchish') return REACTIONS.mature;
    return REACTIONS.playful.concat(REACTIONS.mature);
  }

  function chooseEnding(rng, persona, arc) {
    const matching = ENDINGS.filter(item => item.arcs.includes(arc));
    const pool = matching.length ? matching : ENDINGS;
    return pick(rng,pool);
  }

  function chooseNormalType(rng, persona) {
    return chooseWeightedKey(rng,persona.normalWeights);
  }

  function chooseSignaturePositions(rng,count,wantsTwo) {
    const interior = [];
    for (let i=1;i<count-1;i++) interior.push(i);
    const first = interior[Math.min(interior.length-1, Math.floor(interior.length*.45))];
    if (!wantsTwo || count < 6) return [first];

    const candidates = interior.filter(i => Math.abs(i-first) >= 2);
    if (!candidates.length) return [first];
    return [first,pick(rng,candidates)].sort((a,b) => a-b);
  }

  function enforceFaceStreak(events) {
    let streak = 0;
    for (const event of events) {
      streak = event.faceArea ? streak + 1 : 0;
      if (streak >= 3) return false;
    }
    return true;
  }

  function attachExpressionAndReaction(rng, persona, arc, events) {
    const expressionPool = chooseExpressionPool(persona,arc);
    const reactionPool = chooseReactionPool(persona);
    const [minExpr,maxExpr] = persona.expressionCount;
    const expressionCount = minExpr === maxExpr ? minExpr : (rng() < .5 ? minExpr : maxExpr);
    const candidateIndexes = events.map((_,i) => i).filter(i => i > 0);
    const used = new Set();

    for (let i=0;i<expressionCount && candidateIndexes.length;i++) {
      const idx = pick(rng,candidateIndexes.filter(x => !used.has(x)));
      if (idx == null) break;
      used.add(idx);
      events[idx].suffixes.push(pick(rng,expressionPool));
    }

    if (rng() < persona.reactionRate) {
      const signatures = events.map((event,i) => ({event,i})).filter(x => x.event.type === 'signature');
      const target = signatures.length ? pick(rng,signatures).i : Math.min(events.length-1,2);
      events[target].suffixes.push(pick(rng,reactionPool));
    }

    if (rng() < persona.humanNoiseRate) {
      const targets = events.map((event,i) => ({event,i}))
        .filter(x => x.i > 0 && x.i < events.length-1 && x.event.type !== 'signature');
      if (targets.length) pick(rng,targets).event.suffixes.push(pick(rng,HUMAN_NOISE));
    }
  }

  function buildActionEvents(persona, outfit, rng) {
    const count = chooseActionCount(rng,persona);
    const arc = chooseArc(rng,persona);
    const usedIds = new Set();
    const outfitFlags = new Set(outfit.flags || []);
    const secondSignature = rng() < persona.secondSignatureRate;
    const signaturePositions = chooseSignaturePositions(rng,count,secondSignature);
    const signatures = signatureCandidates(persona,arc);
    if (!signatures.length) return null;

    const events = [];

    for (let i=0;i<count;i++) {
      if (i === count-1) {
        const ending = chooseEnding(rng,persona,arc);
        events.push({...ending,suffixes:[]});
        continue;
      }

      if (signaturePositions.includes(i)) {
        let pool = signatures.filter(item => !usedIds.has(item.id));
        if (!pool.length) pool = signatures;
        const item = pick(rng,pool);
        usedIds.add(item.id);
        events.push({...item,suffixes:[]});
        continue;
      }

      let type;
      if (i === 0) {
        type = persona.id === 'cool_clean_minimal' ? 'look' :
          persona.id === 'subtle_sexy_daily' ? 'pose' :
          persona.id === 'sporty_sweet_spicy' ? 'distance' : 'pose';
      } else {
        type = chooseNormalType(rng,persona);
      }

      let item = pickNormalAction(rng,persona,type,outfitFlags,usedIds);
      if (!item) return null;
      usedIds.add(item.id);
      events.push({...item,suffixes:[]});
    }

    if (!events.some(event => event.bodyArea)) {
      const replaceIndex = events.findIndex((event,i) => i>0 && i<events.length-1 && event.type !== 'signature');
      if (replaceIndex >= 0) {
        const bodyItem = pickNormalAction(rng,persona,'pose',outfitFlags,usedIds);
        if (bodyItem) events[replaceIndex] = {...bodyItem,suffixes:[]};
      }
    }

    if (!enforceFaceStreak(events)) return null;
    attachExpressionAndReaction(rng,persona,arc,events);

    return {events,arc,count,signatureCount:events.filter(e => e.type === 'signature').length};
  }

  function renderAction(actionData) {
    const connectors = ['人物先','随后','接着','之后','随后','接下来','最后'];
    const parts = actionData.events.map((event,index) => {
      let prefix = connectors[Math.min(index,connectors.length-1)];

      if (index === 0 && event.text.startsWith('先')) {
        prefix = '人物';
      }

      if (index === actionData.events.length - 1) {
        prefix = event.text.startsWith('最后') ? '' : '最后';
      }

      let text = prefix + event.text;
      if (event.suffixes?.length) text += '，' + event.suffixes.join('，');
      return text;
    });
    let text = parts.join('。') + '。';

    for (const banned of TEXT_BLACKLIST) {
      if (text.includes(banned)) return null;
    }
    for (const banned of ACTION_BLACKLIST) {
      if (text.includes(banned)) return null;
    }
    return text;
  }

  function generateAction(persona, outfit, rng) {
    for (let attempt=0; attempt<MAX_ATTEMPTS; attempt++) {
      const data = buildActionEvents(persona,outfit,rng);
      if (!data) continue;
      if (data.count < 5 || data.count > 7) continue;
      if (data.signatureCount < 1 || data.signatureCount > 2) continue;

      const signatureIndexes = data.events.map((e,i) => e.type === 'signature' ? i : -1).filter(i => i >= 0);
      if (signatureIndexes.length === 2 && Math.abs(signatureIndexes[0] - signatureIndexes[1]) < 2) continue;

      const text = renderAction(data);
      if (!text) continue;

      const signature = [persona.id,data.arc,data.events.map(e => e.id).join('+')].join('|');
      return {text,arc:data.arc,count:data.count,signatureCount:data.signatureCount,signature};
    }
    return null;
  }

  function buildBundle(seed) {
    const normalized = normalizeSeed(seed);
    if (!normalized) throw new Error('Persona Seed 必须是正整数');
    const rng = createRng(normalized);
    const persona = choosePersona(rng);

    for (let attempt=0; attempt<MAX_ATTEMPTS; attempt++) {
      const clothes = generateClothes(persona,rng);
      if (!clothes) continue;

      const performance = generatePerformance(persona,rng);
      if (!performance) continue;

      const action = generateAction(persona,clothes,rng);
      if (!action) continue;

      const combined = clothes.text + performance.text + action.text;
      if (TEXT_BLACKLIST.some(term => combined.includes(term))) continue;

      return {
        seed:normalized,
        personaId:persona.id,
        personaName:persona.name,
        clothes:clothes.text,
        performance:performance.text,
        action:action.text,
        actionCount:action.count,
        signatureCount:action.signatureCount,
        arc:action.arc,
        signature:[
          persona.id,
          clothes.signature,
          performance.signature,
          action.signature
        ].join('||')
      };
    }

    throw new Error('当前 Persona Seed 未生成可用组合');
  }

  function readRecent() {
    try {
      const value = JSON.parse(localStorage.getItem(PERSONA_RECENT_KEY) || '[]');
      return Array.isArray(value) ? value.slice(0,RECENT_LIMIT) : [];
    } catch {
      return [];
    }
  }

  function rememberBundle(bundle) {
    const recent = readRecent().filter(item => item?.signature !== bundle.signature);
    const next = [{
      ...bundle,
      createdAt:Date.now()
    },...recent].slice(0,RECENT_LIMIT);

    localStorage.setItem(PERSONA_RECENT_KEY,JSON.stringify(next));
    localStorage.setItem(PERSONA_LAST_KEY,JSON.stringify({
      ...bundle,
      createdAt:Date.now()
    }));
  }

  function generateUniqueRandomBundle() {
    const recentItems = readRecent();
    const recent = new Set(recentItems.map(item => item?.signature).filter(Boolean));
    const recentPersonaIds = new Set(recentItems.slice(0,2).map(item => item?.personaId).filter(Boolean));
    let fallback = null;

    for (let i=0;i<MAX_ATTEMPTS;i++) {
      const result = buildBundle(randomSeed());
      fallback = result;
      if (recent.has(result.signature)) continue;
      if (recentPersonaIds.has(result.personaId) && i < 48) continue;
      return result;
    }
    return fallback || buildBundle(randomSeed());
  }

  function lastBundle() {
    try {
      return JSON.parse(localStorage.getItem(PERSONA_LAST_KEY) || 'null');
    } catch {
      return null;
    }
  }

  function syncLastUI() {
    const last = lastBundle();
    if (lastPersonaName) lastPersonaName.textContent = last ? last.personaName : '尚未生成 Persona';
    if (lastPersonaClothes) lastPersonaClothes.textContent = last?.clothes || '—';
    if (lastPersonaPerformance) lastPersonaPerformance.textContent = last?.performance || '—';
    if (lastPersonaAction) lastPersonaAction.textContent = last?.action || '—';
  }

  function syncTemplateMeta(mode='loaded') {
    if (!editor) return;
    const value = editor.value;
    const states = [
      [CLOTHES_PLACEHOLDER,value.includes(CLOTHES_PLACEHOLDER)],
      [PERFORMANCE_PLACEHOLDER,value.includes(PERFORMANCE_PLACEHOLDER)],
      [ACTION_PLACEHOLDER,value.includes(ACTION_PLACEHOLDER)]
    ];
    const allReady = states.every(item => item[1]);

    if (count) count.textContent = value.length + ' 字符';
    if (variableDot) variableDot.className = 'prompt-variable-dot ' + (allReady ? 'ok' : 'warn');
    if (variableText) variableText.textContent = states.map(item => item[0] + ' ' + (item[1] ? '✓' : '未检测')).join(' · ');

    if (saveState) {
      const saved = localStorage.getItem(PROMPT_TEMPLATE_KEY);
      saveState.textContent = mode === 'saved'
        ? '已自动保存'
        : (saved === null ? '使用网站内置模板' : '已加载自定义模板');
    }
  }

  function openPromptSettings() {
    if (typeof closeDrawers === 'function') closeDrawers();
    editor.value = currentTemplate();
    syncTemplateMeta('loaded');
    syncLastUI();
    overlay.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
  }


  const IMAGE_POSTURES = {
    soft_daily_girlfriend:[
      '自然站立，身体轻微偏向一侧，肩膀放松',
      '双手自然放在身前，身体重心轻轻落在一侧',
      '轻微侧身站立，视线自然看向镜头'
    ],
    playful_social:[
      '身体轻微前倾，姿态轻快有镜头感',
      '一条腿自然向前，站姿活泼但不过分摆拍',
      '轻微侧身并保持灵动表情，整体更有社媒感'
    ],
    sweet_soft:[
      '自然站立，姿态柔和，肩颈线条放松',
      '轻微侧身，双手自然靠近身前，整体温柔',
      '身体微微偏向一侧，保持柔和甜感'
    ],
    sweet_cool_spicy:[
      '轻微侧身，身体线条利落，表情带一点冷甜反差',
      '重心放在一侧，形成干净的不对称站姿',
      '身体三分之二侧向镜头，眼神直接'
    ],
    light_mature_city:[
      '自然轻微侧身，站姿利落，从容看向镜头',
      '重心稳定落在一侧，身体线条清晰',
      '身体三分之二侧身，肩背舒展，镜头感稳定'
    ],
    subtle_sexy_daily:[
      '轻微侧身，腰胯重心自然变化，线条清晰但克制',
      '身体形成自然S形曲线，直接看向镜头',
      '重心放在一侧，肩颈与腰线自然舒展'
    ],
    cool_clean_minimal:[
      '安静站立，身体略微侧转，直接看向镜头',
      '极简直立姿态，肩膀自然偏向一侧',
      '三分之二侧身，表情克制，眼神集中'
    ],
    gentle_elegant:[
      '自然侧身站立，姿态柔和舒展',
      '身体轻微偏向一侧，肩颈放松，整体安静',
      '优雅直立，重心自然，表情温和'
    ],
    lazy_frenchish:[
      '身体松弛地偏向一侧，重心自然下沉',
      '轻微侧身，姿态慵懒，眼神松弛',
      '一侧肩膀略低，身体保持不经意的松散感'
    ],
    refined_rich_daily:[
      '站姿精致克制，身体轻微侧向镜头',
      '双手自然靠近身前，肩颈舒展，整体干净',
      '重心轻轻放在一侧，姿态有造型感但不夸张'
    ],
    sporty_sweet_spicy:[
      '站姿轻快有弹性，一条腿自然向前',
      '身体略微前倾，整体健康有活力',
      '轻微侧身，重心灵活，眼神直接明亮'
    ],
    high_energy_creator:[
      '站姿明确有镜头感，身体姿态变化感强',
      '轻微前倾并直接看镜头，整体像社媒封面定格',
      '重心落在一侧，形成清晰有记忆点的Pose'
    ]
  };

  function imageExpressionText(persona) {
    const map = {
      soft_daily_girlfriend:'像刚注意到镜头一样自然浅笑，真实亲近',
      playful_social:'表情俏皮灵动，带明显社媒镜头感',
      sweet_soft:'温柔微笑，眼神柔和，甜感自然',
      sweet_cool_spicy:'前一秒偏冷，嘴角带一点反差笑意',
      light_mature_city:'稳定直视镜头，带很轻的半笑',
      subtle_sexy_daily:'眼神从容直接，表情克制，带轻微半笑',
      cool_clean_minimal:'表情清冷克制，眼神集中，只保留很淡的嘴角变化',
      gentle_elegant:'温柔安静地看向镜头，笑意很轻',
      lazy_frenchish:'眼神略松弛，带不经意的半笑',
      refined_rich_daily:'浅笑克制，带一点精致矜持感',
      sporty_sweet_spicy:'眼神明亮直接，表情轻快有活力',
      high_energy_creator:'表情反馈明确，笑意自然，熟悉镜头但不夸张'
    };
    return map[persona.id] || '自然看向镜头，表情真实放松';
  }

  function generateImagePromptFromBundle(bundle) {
    const persona = PERSONAS.find(item => item.id === bundle.personaId) || PERSONAS[0];
    const rng = createRng(((bundle.seed * 1664525) + 1013904223) >>> 0 || 1);
    const posturePool = IMAGE_POSTURES[persona.id] || ['自然站立，身体姿态放松'];
    const posture = pick(rng,posturePool);
    const expression = imageExpressionText(persona);

    return [
      '年轻成年东亚女性真人写实人像。',
      '服装：' + bundle.clothes,
      '人物' + posture + '，' + expression + '。',
      '保持同一个真实人物身份与稳定五官比例，长黑发自然披散，精致但自然的日常妆容。',
      '真实高端智能手机人像摄影质感，中近景到大腿景别，人物为画面主体，构图自然，轻微真实景深。',
      '肤色自然通透并保留真实皮肤纹理，头发、服装与环境材质细节清晰，光线真实柔和，不过度磨皮，不过度电影化。'
    ].join('');
  }

  function generateImagePromptBundle() {
    const bundle = generateUniqueRandomBundle();
    rememberBundle(bundle);
    syncLastUI();

    return {
      ...bundle,
      prompt:generateImagePromptFromBundle(bundle),
      personaSeed:bundle.seed
    };
  }

  function finalPromptForBundle(template,bundle) {
    let value = template;
    if (value.includes(CLOTHES_PLACEHOLDER)) value = value.replace(CLOTHES_PLACEHOLDER,bundle.clothes);
    if (value.includes(PERFORMANCE_PLACEHOLDER)) value = value.replace(PERFORMANCE_PLACEHOLDER,bundle.performance);
    if (value.includes(ACTION_PLACEHOLDER)) value = value.replace(ACTION_PLACEHOLDER,bundle.action);
    return value;
  }

  function generatePromptBundle(seed=null) {
    const template = currentTemplate();
    if (!template.trim()) throw new Error('提示词模板为空');

    const required = [
      [CLOTHES_PLACEHOLDER,'{{clothes}}'],
      [PERFORMANCE_PLACEHOLDER,'{{performance}}'],
      [ACTION_PLACEHOLDER,'{{action}}']
    ];
    const missing = required.filter(item => !template.includes(item[0])).map(item => item[1]);
    if (missing.length) {
      throw new Error('提示词模板缺少联动变量：' + missing.join('、'));
    }

    const bundle = seed ? buildBundle(seed) : generateUniqueRandomBundle();
    rememberBundle(bundle);
    syncLastUI();

    return {
      ...bundle,
      prompt:finalPromptForBundle(template,bundle),
      personaSeed:bundle.seed
    };
  }

  function fillPrompt(targetId) {
    const target = $(targetId);
    if (!target) return;

    try {
      const result = generatePromptBundle(null);
      target.value = result.prompt;
      target.dispatchEvent(new Event('input',{bubbles:true}));
      target.dispatchEvent(new Event('change',{bubbles:true}));
      target.focus();

      if (typeof toast === 'function') {
        toast('提示词已生成 · ' + result.personaName + ' · Seed ' + result.personaSeed,'good');
      }
    } catch (error) {
      if (typeof toast === 'function') toast(error?.message || 'Persona 生成失败','bad');
    }
  }

  document.querySelectorAll('.image-prompt-quick-fill').forEach(button => {
    button.addEventListener('click',() => {
      const target = $(button.dataset.imagePromptTarget || '');
      if (!target) return;

      try {
        const result = generateImagePromptBundle();
        target.value = result.prompt;
        target.dispatchEvent(new Event('input',{bubbles:true}));
        target.dispatchEvent(new Event('change',{bubbles:true}));
        target.focus();

        if (typeof toast === 'function') {
          toast('图片提示词已生成 · ' + result.personaName,'good');
        }
      } catch (error) {
        if (typeof toast === 'function') toast(error?.message || '图片提示词生成失败','bad');
      }
    });
  });

  $('#openPromptSettings')?.addEventListener('click',openPromptSettings);
  $('#promptQuickFill')?.addEventListener('click',() => fillPrompt('#promptInput'));
  $('#multiFastPromptQuickFill')?.addEventListener('click',() => fillPrompt('#multiFastPromptInput'));

  editor?.addEventListener('input',() => {
    localStorage.setItem(PROMPT_TEMPLATE_KEY,editor.value);
    syncTemplateMeta('saved');
  });

  window.addEventListener('storage',event => {
    if (event.key === PROMPT_TEMPLATE_KEY && !overlay?.classList.contains('hidden')) {
      editor.value = currentTemplate();
      syncTemplateMeta('loaded');
    }
    if (event.key === PERSONA_LAST_KEY) syncLastUI();
  });

  syncLastUI();

  window.RHImagePromptGenerator = Object.freeze({
    generateRandom() {
      return generateImagePromptBundle();
    }
  });

  window.RHPromptGenerator = Object.freeze({
    generateRandom() {
      return generatePromptBundle(null);
    },
    generate(seed) {
      return generatePromptBundle(seed);
    }
  });

  window.RHPersonaGenerator = Object.freeze({
    generate(seed) {
      return buildBundle(seed);
    }
  });

  window.RHClothesGenerator = Object.freeze({
    generate(seed) {
      const bundle = buildBundle(seed);
      return {seed:bundle.seed,personaId:bundle.personaId,personaName:bundle.personaName,text:bundle.clothes};
    }
  });

  window.RHPerformanceGenerator = Object.freeze({
    generate(seed) {
      const bundle = buildBundle(seed);
      return {seed:bundle.seed,personaId:bundle.personaId,personaName:bundle.personaName,text:bundle.performance};
    }
  });

  window.RHActionGenerator = Object.freeze({
    generate(seed) {
      const bundle = buildBundle(seed);
      return {seed:bundle.seed,personaId:bundle.personaId,personaName:bundle.personaName,text:bundle.action,actionCount:bundle.actionCount,signatureCount:bundle.signatureCount,arc:bundle.arc};
    }
  });
})();
