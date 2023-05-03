'use strict';const {makeRecipe}=require('ohm-js');const result=makeRecipe(["grammar",{"source":"Arithmetic {\n  Exp\n    = AddExp\n\n  AddExp\n    = AddExp \"+\" MulExp  -- plus\n    | AddExp \"-\" MulExp  -- minus\n    | MulExp\n\n  MulExp\n    = MulExp \"*\" ExpExp  -- times\n    | MulExp \"/\" ExpExp  -- divide\n    | ExpExp\n\n  ExpExp\n    = PriExp \"^\" ExpExp  -- power\n    | PriExp\n\n  PriExp\n    = \"(\" Exp \")\"  -- paren\n    | \"+\" PriExp   -- pos\n    | \"-\" PriExp   -- neg\n    | ident\n    | number\n\n  ident  (an identifier)\n    = letter alnum*\n\n  number  (a number)\n    = digit* \".\" digit+  -- fract\n    | digit+             -- whole\n}"},"Arithmetic",null,"Exp",{"Exp":["define",{"sourceInterval":[15,31]},null,[],["app",{"sourceInterval":[25,31]},"AddExp",[]]],"AddExp_plus":["define",{"sourceInterval":[48,74]},null,[],["seq",{"sourceInterval":[48,65]},["app",{"sourceInterval":[48,54]},"AddExp",[]],["terminal",{"sourceInterval":[55,58]},"+"],["app",{"sourceInterval":[59,65]},"MulExp",[]]]],"AddExp_minus":["define",{"sourceInterval":[81,108]},null,[],["seq",{"sourceInterval":[81,98]},["app",{"sourceInterval":[81,87]},"AddExp",[]],["terminal",{"sourceInterval":[88,91]},"-"],["app",{"sourceInterval":[92,98]},"MulExp",[]]]],"AddExp":["define",{"sourceInterval":[35,121]},null,[],["alt",{"sourceInterval":[48,121]},["app",{"sourceInterval":[48,65]},"AddExp_plus",[]],["app",{"sourceInterval":[81,98]},"AddExp_minus",[]],["app",{"sourceInterval":[115,121]},"MulExp",[]]]],"MulExp_times":["define",{"sourceInterval":[138,165]},null,[],["seq",{"sourceInterval":[138,155]},["app",{"sourceInterval":[138,144]},"MulExp",[]],["terminal",{"sourceInterval":[145,148]},"*"],["app",{"sourceInterval":[149,155]},"ExpExp",[]]]],"MulExp_divide":["define",{"sourceInterval":[172,200]},null,[],["seq",{"sourceInterval":[172,189]},["app",{"sourceInterval":[172,178]},"MulExp",[]],["terminal",{"sourceInterval":[179,182]},"/"],["app",{"sourceInterval":[183,189]},"ExpExp",[]]]],"MulExp":["define",{"sourceInterval":[125,213]},null,[],["alt",{"sourceInterval":[138,213]},["app",{"sourceInterval":[138,155]},"MulExp_times",[]],["app",{"sourceInterval":[172,189]},"MulExp_divide",[]],["app",{"sourceInterval":[207,213]},"ExpExp",[]]]],"ExpExp_power":["define",{"sourceInterval":[230,257]},null,[],["seq",{"sourceInterval":[230,247]},["app",{"sourceInterval":[230,236]},"PriExp",[]],["terminal",{"sourceInterval":[237,240]},"^"],["app",{"sourceInterval":[241,247]},"ExpExp",[]]]],"ExpExp":["define",{"sourceInterval":[217,270]},null,[],["alt",{"sourceInterval":[230,270]},["app",{"sourceInterval":[230,247]},"ExpExp_power",[]],["app",{"sourceInterval":[264,270]},"PriExp",[]]]],"PriExp_paren":["define",{"sourceInterval":[287,308]},null,[],["seq",{"sourceInterval":[287,298]},["terminal",{"sourceInterval":[287,290]},"("],["app",{"sourceInterval":[291,294]},"Exp",[]],["terminal",{"sourceInterval":[295,298]},")"]]],"PriExp_pos":["define",{"sourceInterval":[315,334]},null,[],["seq",{"sourceInterval":[315,325]},["terminal",{"sourceInterval":[315,318]},"+"],["app",{"sourceInterval":[319,325]},"PriExp",[]]]],"PriExp_neg":["define",{"sourceInterval":[341,360]},null,[],["seq",{"sourceInterval":[341,351]},["terminal",{"sourceInterval":[341,344]},"-"],["app",{"sourceInterval":[345,351]},"PriExp",[]]]],"PriExp":["define",{"sourceInterval":[274,385]},null,[],["alt",{"sourceInterval":[287,385]},["app",{"sourceInterval":[287,298]},"PriExp_paren",[]],["app",{"sourceInterval":[315,325]},"PriExp_pos",[]],["app",{"sourceInterval":[341,351]},"PriExp_neg",[]],["app",{"sourceInterval":[367,372]},"ident",[]],["app",{"sourceInterval":[379,385]},"number",[]]]],"ident":["define",{"sourceInterval":[389,431]},"an identifier",[],["seq",{"sourceInterval":[418,431]},["app",{"sourceInterval":[418,424]},"letter",[]],["star",{"sourceInterval":[425,431]},["app",{"sourceInterval":[425,430]},"alnum",[]]]]],"number_fract":["define",{"sourceInterval":[460,487]},null,[],["seq",{"sourceInterval":[460,477]},["star",{"sourceInterval":[460,466]},["app",{"sourceInterval":[460,465]},"digit",[]]],["terminal",{"sourceInterval":[467,470]},"."],["plus",{"sourceInterval":[471,477]},["app",{"sourceInterval":[471,476]},"digit",[]]]]],"number_whole":["define",{"sourceInterval":[494,521]},null,[],["plus",{"sourceInterval":[494,500]},["app",{"sourceInterval":[494,499]},"digit",[]]]],"number":["define",{"sourceInterval":[435,521]},"a number",[],["alt",{"sourceInterval":[460,521]},["app",{"sourceInterval":[460,477]},"number_fract",[]],["app",{"sourceInterval":[494,500]},"number_whole",[]]]]}]);module.exports=result;