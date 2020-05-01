
/*

有个小请求，就是给下面的所有的 Scratch Opcode 定一个 Scratch Script 函数名，谢谢了！
要求：纯英文，无数字，无下划线，严格大小写，推荐驼峰式，不能有冲突

control_repeat
control_repeat_until
control_while
control_for_each
control_forever
control_wait
control_wait_until
control_if
control_if_else
control_stop
control_create_clone_of
control_delete_this_clone

control_start_as_clone

motion_movesteps
motion_gotoxy
motion_goto
motion_turnright
motion_turnleft
motion_pointindirection
motion_pointtowards
motion_glidesecstoxy
motion_glideto
motion_ifonedgebounce
motion_setrotationstyle
motion_changexby
motion_setx
motion_changeyby
motion_sety
motion_xposition
motion_yposition
motion_direction

looks_say
looks_sayforsecs
looks_think
looks_thinkforsecs
looks_show
looks_hide
looks_hideallsprites
looks_switchcostumeto
looks_switchbackdropto
looks_switchbackdroptoandwait
looks_nextcostume
looks_nextbackdrop
looks_changeeffectby
looks_seteffectto
looks_cleargraphiceffects
looks_changesizeby
looks_setsizeto
looks_changestretchby
looks_setstretchto
looks_gotofrontback
looks_goforwardbackwardlayers
looks_size
looks_costumenumbername
looks_backdropnumbername

operator_add
operator_subtract
operator_multiply
operator_divide
operator_lt
operator_equals
operator_gt
operator_and
operator_or
operator_not
operator_random
operator_join
operator_letter_of
operator_length
operator_contains
operator_mod
operator_round
operator_mathop
operator_power
operator_bitand
operator_bitor
operator_bitxor
operator_bitnot
operator_le
operator_ge
operator_nequals

data_variable
data_setvariableto
data_changevariableby
data_hidevariable
data_showvariable
data_listcontents
data_addtolist
data_deleteoflist
data_deletealloflist
data_insertatlist
data_replaceitemoflist
data_itemoflist
data_itemnumoflist
data_lengthoflist
data_listcontainsitem
data_hidelist
data_showlist

procedures_definition
procedures_call
argument_reporter_string_number
argument_reporter_boolean

sensing_touchingobject
sensing_touchingcolor
sensing_coloristouchingcolor
sensing_distanceto
sensing_timer
sensing_resettimer
sensing_of
sensing_mousex
sensing_mousey
sensing_setdragmode
sensing_mousedown
sensing_keypressed
sensing_current
sensing_dayssince2000
sensing_loudness
sensing_loud
sensing_askandwait
sensing_answer
sensing_username

sound_play
sound_playuntildone
sound_stopallsounds
sound_seteffectto
sound_changeeffectby
sound_cleareffects
sound_sounds_menu
sound_beats_menu
sound_effects_menu
sound_setvolumeto
sound_changevolumeby
sound_volume

pen_clear
pen_stamp
pen_penDown
pen_penUp
pen_setPenColorToColor
pen_changePenColorParamBy
pen_setPenColorParamTo
pen_changePenSizeBy
pen_setPenSizeTo
pen_setPenShadeToNumber
pen_changePenShadeBy
pen_setPenHueToNumber
pen_changePenHueBy

music_playDrumForBeats
music_midiPlayDrumForBeats
music_restForBeats
music_playNoteForBeats
music_setInstrument
music_midiSetInstrument
music_setTempo
music_changeTempo
music_getTempo

translate_getTranslate
translate_getViewerLanguage

*/

/*
EN:
Core modules rules:
CN:
核心模块定义规范：
按照每个
*/
function concatObjects (...objs) {
    const ret = {}
    for (const obj of objs) {
        Object.assign(ret, obj)
    }
    return ret
}

module.exports = concatObjects(
    require('./events'),
    require('./motions'),
    require('./operators'),
    require('./data'),
    require('./looks')
)
