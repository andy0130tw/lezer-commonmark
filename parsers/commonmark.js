// This file was generated by lezer-generator. You probably shouldn't edit it.
import {Parser} from "lezer"
import {scanLineStart, scanThematicBreak} from "./tokens"
import {NodeProp} from "lezer"
export const parser = Parser.deserialize({
  states: "$nOPOVOOOdOVO'#CfOwOSO'#C^O{OUO'#C^O!SOVO'#CgO!gOSO'#C`O!kOTO'#CcOOOS'#C_'#C_O!rOVO'#ChOOOS(3@v(3@vOOOS'#Ca'#CaO#VOVO'#CiOOOS(3@w(3@wOOOS'#Co'#CoOOOS(3@t(3@tQOOOOOOOOS,58|,58|OOOS,58x,58xO#jOSO,58xO#nOSO,58zOOOS,58},58}OOOS,58z,58zO!OOSO'#C`OOOS-E6a-E6aOOOS,59O,59OOOOS,59P,59POOOS1G.d1G.dOOOS1G.f1G.f",
  stateData: "#r~_RO`UOa[ObQOeTO^YP~_RO`UOa[ObQOeTO^YX~daO~bbOecO~`UO^ZX_ZXaZXbZXeZX~deO~_fOeTO~_fOeTO^[X`[Xa[Xb[X~a[O^]X_]X`]Xb]Xe]X~djO~dkO~",
  goto: "!mdPPeeieqw!O!V!^!a!eePPPPP!iT]OPUXOPWRgUQPOR`PSSOPRdSSWOPRhWSZOPRiZR_OTVOPTYOPT^OP",
  nodeNames: "⚠ Root ThematicBreak IndentedCodeBlock Line GenericBlock",
  nodeProps: [
    [NodeProp.top, 1,true]
  ],
  repeatNodeCount: 4,
  tokenData: "q~RRYZ[]^ap~i~aOd~~fPd~YZ[~nPe~p~i",
  tokenizers: [scanLineStart, scanThematicBreak, 0],
  topRules: {"Root":[0,1]},
  specializeTable: 0,
  tokenPrec: 0
})