'use strict';const {makeRecipe}=require('ohm-js');const result=makeRecipe(["grammar",{"source":"Jay {\r\n\tProg = Expr end\r\n\t| \"\" end\r\n\r\n\tExpr = Appl_Expr \"\" \"\" \"\" \"\" \"\"\r\n\t| Variant_label Expr  \"\" \"\" \"\" \"\"\r\n  | Expr \"*\" Expr \"\" \"\" \"\"\r\n  | Expr \"\\\\\" Expr \"\" \"\" \"\"\r\n  | Expr \"%\" Expr \"\" \"\" \"\"\r\n  | Expr \"+\" Expr \"\" \"\" \"\"\r\n  | Expr \"-\" Expr \"\" \"\" \"\"\r\n  | Expr \"::\" Expr \"\" \"\" \"\"\r\n  | Expr \"==\" Expr \"\" \"\" \"\"\r\n  | Expr \"<>\" Expr \"\" \"\" \"\"\r\n  | Expr \">\" Expr \"\" \"\" \"\"\r\n  | Expr \">=\" Expr \"\" \"\" \"\"\r\n  | Expr \"<\" Expr \"\" \"\" \"\"\r\n  | Expr \"<=\" Expr \"\" \"\" \"\"\r\n  | \"not\" Expr \"\" \"\" \"\" \"\"\r\n  | Expr \"and\" Expr \"\" \"\" \"\"\r\n  | Expr \"or\" Expr \"\" \"\" \"\"\r\n  | \"if\" Expr \"then\" Expr \"else\" Expr \r\n  | Function Param_list \"->\" Expr \"\" \"\"  \r\n  | \"let\" \"rec\" Fun_sig_list \"in\" Expr \"\"\r\n  | \"let\" Ident_decl \"=\" Expr \"in\" Expr \r\n  | \"let\" Fun_sig \"in\" Expr  \"\" \"\"\r\n  | \"match\" Expr \"with\" \"|\"? Match_expr_list End\r\n    \r\n\tFunction = \"fun\"\r\n\t| \"function\"\r\n  \r\n\tEnd = \"end\"\r\n\tAppl_Expr = Appl_Expr Primary_expr\r\n\t| Primary_expr \"\"\r\n  \r\n\tFun_sig = Ident_decl Param_list \"=\" Expr\r\n\tFun_sig_list = Fun_sig \"\" \"\"\r\n\t| Fun_sig \"with\" Fun_sig_list\r\n\tPrimary_expr = digit+ \"\" \"\"\r\n\t| \"true\" \"\" \"\"\r\n\t| \"false\" \"\" \"\"\r\n\t| Ident_usage\t\"\" \"\"\r\n\t| \"{\" Record_body \"}\"\r\n\t| \"{\" \"}\" \"\"\r\n\t| \"[\" List_body \"]\"\r\n\t| \"[\" \"]\" \"\"\r\n\t| \"(\" Expr \")\"\r\n\t| Primary_expr \".\" Label \r\n\tParam_list = Ident_decl Param_list\r\n\t| Ident_decl \"\"\r\n\tLabel = Identifier\r\n\tIdent_usage = Ident_decl\r\n\tIdent_decl = Identifier\r\n\tRecord_body = Label \"=\" Expr \"\" \"\"\r\n\t| Label \"=\" Expr \",\" Record_body\r\n\tList_body = Expr \",\" List_body\r\n\t| Expr \"\" \"\"\r\n\tVariant_label = \"`\" Identifier\r\n\tMatch_expr_list = Match_expr \"|\" Match_expr_list\r\n\t| Match_expr \"\" \"\"\r\n\tMatch_expr = Pattern \"->\" Expr\r\n\tPattern = \"_\" \"\" \"\" \"\"\r\n\t| digit+ \"\" \"\" \"\"\r\n\t| \"bool\" \"\" \"\" \"\"\r\n\t| Function \"\" \"\" \"\"\r\n\t| Identifier \"\" \"\" \"\"\r\n\t| Variant_label Ident_decl \"\" \"\"\r\n\t| Variant_label \"(\" Ident_decl \")\"\r\n\t| \"{\" \"_\" \"}\" \"\"\r\n\t| \"{\" \"}\" \"\" \"\" \r\n\t| \"[\" \"]\" \"\" \"\"\r\n\t| Ident_decl \"::\" Ident_decl \"\"\r\n\t| \"(\" Pattern \")\" \"\"\r\n\tIdentifier = ident_start ident_cont*\r\n\tident_start = letter | \"_\" \r\n\tident_cont = letter | digit | \"_\"\r\n\tRecord_pattern_element = Label \"=\" Ident_decl\r\n\r\n}"},"Jay",null,"Prog",{"Prog":["define",{"sourceInterval":[8,34]},null,[],["alt",{"sourceInterval":[15,34]},["seq",{"sourceInterval":[15,23]},["app",{"sourceInterval":[15,19]},"Expr",[]],["app",{"sourceInterval":[20,23]},"end",[]]],["seq",{"sourceInterval":[28,34]},["terminal",{"sourceInterval":[28,30]},""],["app",{"sourceInterval":[31,34]},"end",[]]]]],"Expr":["define",{"sourceInterval":[39,789]},null,[],["alt",{"sourceInterval":[46,789]},["seq",{"sourceInterval":[46,70]},["app",{"sourceInterval":[46,55]},"Appl_Expr",[]],["terminal",{"sourceInterval":[56,58]},""],["terminal",{"sourceInterval":[59,61]},""],["terminal",{"sourceInterval":[62,64]},""],["terminal",{"sourceInterval":[65,67]},""],["terminal",{"sourceInterval":[68,70]},""]],["seq",{"sourceInterval":[75,106]},["app",{"sourceInterval":[75,88]},"Variant_label",[]],["app",{"sourceInterval":[89,93]},"Expr",[]],["terminal",{"sourceInterval":[95,97]},""],["terminal",{"sourceInterval":[98,100]},""],["terminal",{"sourceInterval":[101,103]},""],["terminal",{"sourceInterval":[104,106]},""]],["seq",{"sourceInterval":[112,134]},["app",{"sourceInterval":[112,116]},"Expr",[]],["terminal",{"sourceInterval":[117,120]},"*"],["app",{"sourceInterval":[121,125]},"Expr",[]],["terminal",{"sourceInterval":[126,128]},""],["terminal",{"sourceInterval":[129,131]},""],["terminal",{"sourceInterval":[132,134]},""]],["seq",{"sourceInterval":[140,163]},["app",{"sourceInterval":[140,144]},"Expr",[]],["terminal",{"sourceInterval":[145,149]},"\\"],["app",{"sourceInterval":[150,154]},"Expr",[]],["terminal",{"sourceInterval":[155,157]},""],["terminal",{"sourceInterval":[158,160]},""],["terminal",{"sourceInterval":[161,163]},""]],["seq",{"sourceInterval":[169,191]},["app",{"sourceInterval":[169,173]},"Expr",[]],["terminal",{"sourceInterval":[174,177]},"%"],["app",{"sourceInterval":[178,182]},"Expr",[]],["terminal",{"sourceInterval":[183,185]},""],["terminal",{"sourceInterval":[186,188]},""],["terminal",{"sourceInterval":[189,191]},""]],["seq",{"sourceInterval":[197,219]},["app",{"sourceInterval":[197,201]},"Expr",[]],["terminal",{"sourceInterval":[202,205]},"+"],["app",{"sourceInterval":[206,210]},"Expr",[]],["terminal",{"sourceInterval":[211,213]},""],["terminal",{"sourceInterval":[214,216]},""],["terminal",{"sourceInterval":[217,219]},""]],["seq",{"sourceInterval":[225,247]},["app",{"sourceInterval":[225,229]},"Expr",[]],["terminal",{"sourceInterval":[230,233]},"-"],["app",{"sourceInterval":[234,238]},"Expr",[]],["terminal",{"sourceInterval":[239,241]},""],["terminal",{"sourceInterval":[242,244]},""],["terminal",{"sourceInterval":[245,247]},""]],["seq",{"sourceInterval":[253,276]},["app",{"sourceInterval":[253,257]},"Expr",[]],["terminal",{"sourceInterval":[258,262]},"::"],["app",{"sourceInterval":[263,267]},"Expr",[]],["terminal",{"sourceInterval":[268,270]},""],["terminal",{"sourceInterval":[271,273]},""],["terminal",{"sourceInterval":[274,276]},""]],["seq",{"sourceInterval":[282,305]},["app",{"sourceInterval":[282,286]},"Expr",[]],["terminal",{"sourceInterval":[287,291]},"=="],["app",{"sourceInterval":[292,296]},"Expr",[]],["terminal",{"sourceInterval":[297,299]},""],["terminal",{"sourceInterval":[300,302]},""],["terminal",{"sourceInterval":[303,305]},""]],["seq",{"sourceInterval":[311,334]},["app",{"sourceInterval":[311,315]},"Expr",[]],["terminal",{"sourceInterval":[316,320]},"<>"],["app",{"sourceInterval":[321,325]},"Expr",[]],["terminal",{"sourceInterval":[326,328]},""],["terminal",{"sourceInterval":[329,331]},""],["terminal",{"sourceInterval":[332,334]},""]],["seq",{"sourceInterval":[340,362]},["app",{"sourceInterval":[340,344]},"Expr",[]],["terminal",{"sourceInterval":[345,348]},">"],["app",{"sourceInterval":[349,353]},"Expr",[]],["terminal",{"sourceInterval":[354,356]},""],["terminal",{"sourceInterval":[357,359]},""],["terminal",{"sourceInterval":[360,362]},""]],["seq",{"sourceInterval":[368,391]},["app",{"sourceInterval":[368,372]},"Expr",[]],["terminal",{"sourceInterval":[373,377]},">="],["app",{"sourceInterval":[378,382]},"Expr",[]],["terminal",{"sourceInterval":[383,385]},""],["terminal",{"sourceInterval":[386,388]},""],["terminal",{"sourceInterval":[389,391]},""]],["seq",{"sourceInterval":[397,419]},["app",{"sourceInterval":[397,401]},"Expr",[]],["terminal",{"sourceInterval":[402,405]},"<"],["app",{"sourceInterval":[406,410]},"Expr",[]],["terminal",{"sourceInterval":[411,413]},""],["terminal",{"sourceInterval":[414,416]},""],["terminal",{"sourceInterval":[417,419]},""]],["seq",{"sourceInterval":[425,448]},["app",{"sourceInterval":[425,429]},"Expr",[]],["terminal",{"sourceInterval":[430,434]},"<="],["app",{"sourceInterval":[435,439]},"Expr",[]],["terminal",{"sourceInterval":[440,442]},""],["terminal",{"sourceInterval":[443,445]},""],["terminal",{"sourceInterval":[446,448]},""]],["seq",{"sourceInterval":[454,476]},["terminal",{"sourceInterval":[454,459]},"not"],["app",{"sourceInterval":[460,464]},"Expr",[]],["terminal",{"sourceInterval":[465,467]},""],["terminal",{"sourceInterval":[468,470]},""],["terminal",{"sourceInterval":[471,473]},""],["terminal",{"sourceInterval":[474,476]},""]],["seq",{"sourceInterval":[482,506]},["app",{"sourceInterval":[482,486]},"Expr",[]],["terminal",{"sourceInterval":[487,492]},"and"],["app",{"sourceInterval":[493,497]},"Expr",[]],["terminal",{"sourceInterval":[498,500]},""],["terminal",{"sourceInterval":[501,503]},""],["terminal",{"sourceInterval":[504,506]},""]],["seq",{"sourceInterval":[512,535]},["app",{"sourceInterval":[512,516]},"Expr",[]],["terminal",{"sourceInterval":[517,521]},"or"],["app",{"sourceInterval":[522,526]},"Expr",[]],["terminal",{"sourceInterval":[527,529]},""],["terminal",{"sourceInterval":[530,532]},""],["terminal",{"sourceInterval":[533,535]},""]],["seq",{"sourceInterval":[541,574]},["terminal",{"sourceInterval":[541,545]},"if"],["app",{"sourceInterval":[546,550]},"Expr",[]],["terminal",{"sourceInterval":[551,557]},"then"],["app",{"sourceInterval":[558,562]},"Expr",[]],["terminal",{"sourceInterval":[563,569]},"else"],["app",{"sourceInterval":[570,574]},"Expr",[]]],["seq",{"sourceInterval":[581,616]},["app",{"sourceInterval":[581,589]},"Function",[]],["app",{"sourceInterval":[590,600]},"Param_list",[]],["terminal",{"sourceInterval":[601,605]},"->"],["app",{"sourceInterval":[606,610]},"Expr",[]],["terminal",{"sourceInterval":[611,613]},""],["terminal",{"sourceInterval":[614,616]},""]],["seq",{"sourceInterval":[624,661]},["terminal",{"sourceInterval":[624,629]},"let"],["terminal",{"sourceInterval":[630,635]},"rec"],["app",{"sourceInterval":[636,648]},"Fun_sig_list",[]],["terminal",{"sourceInterval":[649,653]},"in"],["app",{"sourceInterval":[654,658]},"Expr",[]],["terminal",{"sourceInterval":[659,661]},""]],["seq",{"sourceInterval":[667,702]},["terminal",{"sourceInterval":[667,672]},"let"],["app",{"sourceInterval":[673,683]},"Ident_decl",[]],["terminal",{"sourceInterval":[684,687]},"="],["app",{"sourceInterval":[688,692]},"Expr",[]],["terminal",{"sourceInterval":[693,697]},"in"],["app",{"sourceInterval":[698,702]},"Expr",[]]],["seq",{"sourceInterval":[709,739]},["terminal",{"sourceInterval":[709,714]},"let"],["app",{"sourceInterval":[715,722]},"Fun_sig",[]],["terminal",{"sourceInterval":[723,727]},"in"],["app",{"sourceInterval":[728,732]},"Expr",[]],["terminal",{"sourceInterval":[734,736]},""],["terminal",{"sourceInterval":[737,739]},""]],["seq",{"sourceInterval":[745,789]},["terminal",{"sourceInterval":[745,752]},"match"],["app",{"sourceInterval":[753,757]},"Expr",[]],["terminal",{"sourceInterval":[758,764]},"with"],["opt",{"sourceInterval":[765,769]},["terminal",{"sourceInterval":[765,768]},"|"]],["app",{"sourceInterval":[770,785]},"Match_expr_list",[]],["app",{"sourceInterval":[786,789]},"End",[]]]]],"Function":["define",{"sourceInterval":[798,829]},null,[],["alt",{"sourceInterval":[809,829]},["terminal",{"sourceInterval":[809,814]},"fun"],["terminal",{"sourceInterval":[819,829]},"function"]]],"End":["define",{"sourceInterval":[836,847]},null,[],["terminal",{"sourceInterval":[842,847]},"end"]],"Appl_Expr":["define",{"sourceInterval":[850,904]},null,[],["alt",{"sourceInterval":[862,904]},["seq",{"sourceInterval":[862,884]},["app",{"sourceInterval":[862,871]},"Appl_Expr",[]],["app",{"sourceInterval":[872,884]},"Primary_expr",[]]],["seq",{"sourceInterval":[889,904]},["app",{"sourceInterval":[889,901]},"Primary_expr",[]],["terminal",{"sourceInterval":[902,904]},""]]]],"Fun_sig":["define",{"sourceInterval":[911,951]},null,[],["seq",{"sourceInterval":[921,951]},["app",{"sourceInterval":[921,931]},"Ident_decl",[]],["app",{"sourceInterval":[932,942]},"Param_list",[]],["terminal",{"sourceInterval":[943,946]},"="],["app",{"sourceInterval":[947,951]},"Expr",[]]]],"Fun_sig_list":["define",{"sourceInterval":[954,1014]},null,[],["alt",{"sourceInterval":[969,1014]},["seq",{"sourceInterval":[969,982]},["app",{"sourceInterval":[969,976]},"Fun_sig",[]],["terminal",{"sourceInterval":[977,979]},""],["terminal",{"sourceInterval":[980,982]},""]],["seq",{"sourceInterval":[987,1014]},["app",{"sourceInterval":[987,994]},"Fun_sig",[]],["terminal",{"sourceInterval":[995,1001]},"with"],["app",{"sourceInterval":[1002,1014]},"Fun_sig_list",[]]]]],"Primary_expr":["define",{"sourceInterval":[1017,1221]},null,[],["alt",{"sourceInterval":[1032,1221]},["seq",{"sourceInterval":[1032,1044]},["plus",{"sourceInterval":[1032,1038]},["app",{"sourceInterval":[1032,1037]},"digit",[]]],["terminal",{"sourceInterval":[1039,1041]},""],["terminal",{"sourceInterval":[1042,1044]},""]],["seq",{"sourceInterval":[1049,1061]},["terminal",{"sourceInterval":[1049,1055]},"true"],["terminal",{"sourceInterval":[1056,1058]},""],["terminal",{"sourceInterval":[1059,1061]},""]],["seq",{"sourceInterval":[1066,1079]},["terminal",{"sourceInterval":[1066,1073]},"false"],["terminal",{"sourceInterval":[1074,1076]},""],["terminal",{"sourceInterval":[1077,1079]},""]],["seq",{"sourceInterval":[1084,1101]},["app",{"sourceInterval":[1084,1095]},"Ident_usage",[]],["terminal",{"sourceInterval":[1096,1098]},""],["terminal",{"sourceInterval":[1099,1101]},""]],["seq",{"sourceInterval":[1106,1125]},["terminal",{"sourceInterval":[1106,1109]},"{"],["app",{"sourceInterval":[1110,1121]},"Record_body",[]],["terminal",{"sourceInterval":[1122,1125]},"}"]],["seq",{"sourceInterval":[1130,1140]},["terminal",{"sourceInterval":[1130,1133]},"{"],["terminal",{"sourceInterval":[1134,1137]},"}"],["terminal",{"sourceInterval":[1138,1140]},""]],["seq",{"sourceInterval":[1145,1162]},["terminal",{"sourceInterval":[1145,1148]},"["],["app",{"sourceInterval":[1149,1158]},"List_body",[]],["terminal",{"sourceInterval":[1159,1162]},"]"]],["seq",{"sourceInterval":[1167,1177]},["terminal",{"sourceInterval":[1167,1170]},"["],["terminal",{"sourceInterval":[1171,1174]},"]"],["terminal",{"sourceInterval":[1175,1177]},""]],["seq",{"sourceInterval":[1182,1194]},["terminal",{"sourceInterval":[1182,1185]},"("],["app",{"sourceInterval":[1186,1190]},"Expr",[]],["terminal",{"sourceInterval":[1191,1194]},")"]],["seq",{"sourceInterval":[1199,1221]},["app",{"sourceInterval":[1199,1211]},"Primary_expr",[]],["terminal",{"sourceInterval":[1212,1215]},"."],["app",{"sourceInterval":[1216,1221]},"Label",[]]]]],"Param_list":["define",{"sourceInterval":[1225,1277]},null,[],["alt",{"sourceInterval":[1238,1277]},["seq",{"sourceInterval":[1238,1259]},["app",{"sourceInterval":[1238,1248]},"Ident_decl",[]],["app",{"sourceInterval":[1249,1259]},"Param_list",[]]],["seq",{"sourceInterval":[1264,1277]},["app",{"sourceInterval":[1264,1274]},"Ident_decl",[]],["terminal",{"sourceInterval":[1275,1277]},""]]]],"Label":["define",{"sourceInterval":[1280,1298]},null,[],["app",{"sourceInterval":[1288,1298]},"Identifier",[]]],"Ident_usage":["define",{"sourceInterval":[1301,1325]},null,[],["app",{"sourceInterval":[1315,1325]},"Ident_decl",[]]],"Ident_decl":["define",{"sourceInterval":[1328,1351]},null,[],["app",{"sourceInterval":[1341,1351]},"Identifier",[]]],"Record_body":["define",{"sourceInterval":[1354,1423]},null,[],["alt",{"sourceInterval":[1368,1423]},["seq",{"sourceInterval":[1368,1388]},["app",{"sourceInterval":[1368,1373]},"Label",[]],["terminal",{"sourceInterval":[1374,1377]},"="],["app",{"sourceInterval":[1378,1382]},"Expr",[]],["terminal",{"sourceInterval":[1383,1385]},""],["terminal",{"sourceInterval":[1386,1388]},""]],["seq",{"sourceInterval":[1393,1423]},["app",{"sourceInterval":[1393,1398]},"Label",[]],["terminal",{"sourceInterval":[1399,1402]},"="],["app",{"sourceInterval":[1403,1407]},"Expr",[]],["terminal",{"sourceInterval":[1408,1411]},","],["app",{"sourceInterval":[1412,1423]},"Record_body",[]]]]],"List_body":["define",{"sourceInterval":[1426,1471]},null,[],["alt",{"sourceInterval":[1438,1471]},["seq",{"sourceInterval":[1438,1456]},["app",{"sourceInterval":[1438,1442]},"Expr",[]],["terminal",{"sourceInterval":[1443,1446]},","],["app",{"sourceInterval":[1447,1456]},"List_body",[]]],["seq",{"sourceInterval":[1461,1471]},["app",{"sourceInterval":[1461,1465]},"Expr",[]],["terminal",{"sourceInterval":[1466,1468]},""],["terminal",{"sourceInterval":[1469,1471]},""]]]],"Variant_label":["define",{"sourceInterval":[1474,1504]},null,[],["seq",{"sourceInterval":[1490,1504]},["terminal",{"sourceInterval":[1490,1493]},"`"],["app",{"sourceInterval":[1494,1504]},"Identifier",[]]]],"Match_expr_list":["define",{"sourceInterval":[1507,1576]},null,[],["alt",{"sourceInterval":[1525,1576]},["seq",{"sourceInterval":[1525,1555]},["app",{"sourceInterval":[1525,1535]},"Match_expr",[]],["terminal",{"sourceInterval":[1536,1539]},"|"],["app",{"sourceInterval":[1540,1555]},"Match_expr_list",[]]],["seq",{"sourceInterval":[1560,1576]},["app",{"sourceInterval":[1560,1570]},"Match_expr",[]],["terminal",{"sourceInterval":[1571,1573]},""],["terminal",{"sourceInterval":[1574,1576]},""]]]],"Match_expr":["define",{"sourceInterval":[1579,1609]},null,[],["seq",{"sourceInterval":[1592,1609]},["app",{"sourceInterval":[1592,1599]},"Pattern",[]],["terminal",{"sourceInterval":[1600,1604]},"->"],["app",{"sourceInterval":[1605,1609]},"Expr",[]]]],"Pattern":["define",{"sourceInterval":[1612,1905]},null,[],["alt",{"sourceInterval":[1622,1905]},["seq",{"sourceInterval":[1622,1634]},["terminal",{"sourceInterval":[1622,1625]},"_"],["terminal",{"sourceInterval":[1626,1628]},""],["terminal",{"sourceInterval":[1629,1631]},""],["terminal",{"sourceInterval":[1632,1634]},""]],["seq",{"sourceInterval":[1639,1654]},["plus",{"sourceInterval":[1639,1645]},["app",{"sourceInterval":[1639,1644]},"digit",[]]],["terminal",{"sourceInterval":[1646,1648]},""],["terminal",{"sourceInterval":[1649,1651]},""],["terminal",{"sourceInterval":[1652,1654]},""]],["seq",{"sourceInterval":[1659,1674]},["terminal",{"sourceInterval":[1659,1665]},"bool"],["terminal",{"sourceInterval":[1666,1668]},""],["terminal",{"sourceInterval":[1669,1671]},""],["terminal",{"sourceInterval":[1672,1674]},""]],["seq",{"sourceInterval":[1679,1696]},["app",{"sourceInterval":[1679,1687]},"Function",[]],["terminal",{"sourceInterval":[1688,1690]},""],["terminal",{"sourceInterval":[1691,1693]},""],["terminal",{"sourceInterval":[1694,1696]},""]],["seq",{"sourceInterval":[1701,1720]},["app",{"sourceInterval":[1701,1711]},"Identifier",[]],["terminal",{"sourceInterval":[1712,1714]},""],["terminal",{"sourceInterval":[1715,1717]},""],["terminal",{"sourceInterval":[1718,1720]},""]],["seq",{"sourceInterval":[1725,1755]},["app",{"sourceInterval":[1725,1738]},"Variant_label",[]],["app",{"sourceInterval":[1739,1749]},"Ident_decl",[]],["terminal",{"sourceInterval":[1750,1752]},""],["terminal",{"sourceInterval":[1753,1755]},""]],["seq",{"sourceInterval":[1760,1792]},["app",{"sourceInterval":[1760,1773]},"Variant_label",[]],["terminal",{"sourceInterval":[1774,1777]},"("],["app",{"sourceInterval":[1778,1788]},"Ident_decl",[]],["terminal",{"sourceInterval":[1789,1792]},")"]],["seq",{"sourceInterval":[1797,1811]},["terminal",{"sourceInterval":[1797,1800]},"{"],["terminal",{"sourceInterval":[1801,1804]},"_"],["terminal",{"sourceInterval":[1805,1808]},"}"],["terminal",{"sourceInterval":[1809,1811]},""]],["seq",{"sourceInterval":[1816,1829]},["terminal",{"sourceInterval":[1816,1819]},"{"],["terminal",{"sourceInterval":[1820,1823]},"}"],["terminal",{"sourceInterval":[1824,1826]},""],["terminal",{"sourceInterval":[1827,1829]},""]],["seq",{"sourceInterval":[1835,1848]},["terminal",{"sourceInterval":[1835,1838]},"["],["terminal",{"sourceInterval":[1839,1842]},"]"],["terminal",{"sourceInterval":[1843,1845]},""],["terminal",{"sourceInterval":[1846,1848]},""]],["seq",{"sourceInterval":[1853,1882]},["app",{"sourceInterval":[1853,1863]},"Ident_decl",[]],["terminal",{"sourceInterval":[1864,1868]},"::"],["app",{"sourceInterval":[1869,1879]},"Ident_decl",[]],["terminal",{"sourceInterval":[1880,1882]},""]],["seq",{"sourceInterval":[1887,1905]},["terminal",{"sourceInterval":[1887,1890]},"("],["app",{"sourceInterval":[1891,1898]},"Pattern",[]],["terminal",{"sourceInterval":[1899,1902]},")"],["terminal",{"sourceInterval":[1903,1905]},""]]]],"Identifier":["define",{"sourceInterval":[1908,1944]},null,[],["seq",{"sourceInterval":[1921,1944]},["app",{"sourceInterval":[1921,1932]},"ident_start",[]],["star",{"sourceInterval":[1933,1944]},["app",{"sourceInterval":[1933,1943]},"ident_cont",[]]]]],"ident_start":["define",{"sourceInterval":[1947,1973]},null,[],["alt",{"sourceInterval":[1961,1973]},["app",{"sourceInterval":[1961,1967]},"letter",[]],["terminal",{"sourceInterval":[1970,1973]},"_"]]],"ident_cont":["define",{"sourceInterval":[1977,2010]},null,[],["alt",{"sourceInterval":[1990,2010]},["app",{"sourceInterval":[1990,1996]},"letter",[]],["app",{"sourceInterval":[1999,2004]},"digit",[]],["terminal",{"sourceInterval":[2007,2010]},"_"]]],"Record_pattern_element":["define",{"sourceInterval":[2013,2058]},null,[],["seq",{"sourceInterval":[2038,2058]},["app",{"sourceInterval":[2038,2043]},"Label",[]],["terminal",{"sourceInterval":[2044,2047]},"="],["app",{"sourceInterval":[2048,2058]},"Ident_decl",[]]]]}]);module.exports=result;